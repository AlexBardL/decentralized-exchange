// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Token.sol";

contract Exchange {

   // Variables
   address public feeAccount;
   uint256 public feeRate;
   address constant ETHER = address(0);        // Allows storage of Ether balances in 'tokens' mapping
   mapping(address => mapping(address => uint256)) public tokens;    //  token => customer => amount
   
   mapping(uint256 => _Order) public orders;
   uint256 public orderCount;

   mapping(uint256 => bool) public ordersCancelled;
   mapping(uint256 => bool) public ordersFilled;

   // Events
   event Deposit(address token, address user, uint256 amount, uint256 balance);
   event Withdraw(address token, address user, uint256 amount, uint256 balance);
   event Order(
      uint256 id,
      address user,
      address tokenGet,
      uint256 amountGet,
      address tokenGive,
      uint256 amountGive,
      uint256 timestamp
   );
   event Cancel(   
      uint256 id,
      address user,
      address tokenGet,
      uint256 amountGet,
      address tokenGive,
      uint256 amountGive,
      uint256 timestamp
   );
   event Trade(   
      uint256 id,
      address user,
      address tokenGet,
      uint256 amountGet,
      address tokenGive,
      uint256 amountGive,
      address userFill,
      uint256 timestamp
   );

   // Structs
   struct _Order {
      uint256 id;
      address user;
      address tokenGet;
      uint256 amountGet;
      address tokenGive;
      uint256 amountGive;
      uint256 timestamp;
   }
   // -------------------------------------------------------------------------

   constructor (address _feeAccount, uint256 _feeRate) {
      feeAccount = _feeAccount;
      feeRate = _feeRate;
   }

   receive() external payable {
      revert();
   }

   function depositEther() payable public {
      tokens[ETHER][msg.sender] += msg.value;
      emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
   }

   function withdrawEther(uint _amount) public {
      require(tokens[ETHER][msg.sender] >= _amount);
      
      tokens[ETHER][msg.sender] -= _amount;
      payable(msg.sender).transfer(_amount);
      emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
   }

   function depositToken(address _token, uint _amount) public {
      require(_token != ETHER);
      require(Token(_token).transferFrom(msg.sender, address(this), _amount));
      
      tokens[_token][msg.sender] += _amount;
      emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
   }

   function withdrawToken(address _token, uint256 _amount) public {
      require(_token != ETHER);
      require(tokens[_token][msg.sender] >= _amount);
      
      tokens[_token][msg.sender] -= _amount;
      require(Token(_token).transfer(msg.sender, _amount));
      emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
   }

   function balanceOf(address _token, address _user) public view returns (uint256) {
      return tokens[_token][_user];
   }

   function makeOrder (
      address _tokenGet, 
      uint256 _amountGet, 
      address _tokenGive, 
      uint256 _amountGive
   ) public {
      orderCount++;
      orders[orderCount] = _Order(
         orderCount, 
         msg.sender, 
         _tokenGet, 
         _amountGet, 
         _tokenGive, 
         _amountGive, 
         block.timestamp
      );
      emit Order(
         orderCount, 
         msg.sender, 
         _tokenGet, 
         _amountGet, 
         _tokenGive, 
         _amountGive, 
         orders[orderCount].timestamp
      );
   }

   function cancelOrder(uint256 _id) public {
      require(_id > 0 && _id <= orderCount);
      _Order storage _order = orders[_id];
      require(address(_order.user) == msg.sender);
      require(_order.id == _id);
      
      ordersCancelled[_id] = true;
      emit Cancel(
         _order.id, 
         msg.sender, 
         _order.tokenGet, 
         _order.amountGet, 
         _order.tokenGive, 
         _order.amountGive, 
         block.timestamp
      );
   }

   function fillOrder(uint256 _id) public {
      require(_id > 0 && _id <= orderCount);
      require(!ordersFilled[_id]);
      require(!ordersCancelled[_id]);
      
      _Order storage _order = orders[_id];
      _trade(
         _order.id, 
         _order.user, 
         _order.tokenGet, 
         _order.amountGet, 
         _order.tokenGive, 
         _order.amountGive
      );
      ordersFilled[_order.id] = true;
   }

   function _trade(
      uint256 _orderId, 
      address _user, 
      address _tokenGet, 
      uint256 _amountGet, 
      address _tokenGive, 
      uint256 _amountGive
      ) internal {
      uint256 _feeAmount = _amountGet * feeRate / 100;

      tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount);
      tokens[_tokenGet][_user] += _amountGet;
      tokens[_tokenGet][feeAccount] += _feeAmount;
      
      tokens[_tokenGive][_user] -= _amountGive;
      tokens[_tokenGive][msg.sender] += _amountGive;
      
      emit Trade(
         _orderId, 
         _user, 
         _tokenGet, 
         _amountGet, 
         _tokenGive, 
         _amountGive, 
         msg.sender, 
         block.timestamp
      );
   }
}