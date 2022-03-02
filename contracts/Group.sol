pragma solidity >=0.7.0 <0.9.0;

contract Group{
    struct Requester{
        uint count;
        bool isValid;
    }

    address public owner; //그룹을 만든 사람

    mapping(string => Requester) public requesters; //key: user account address, value: Requester

    constructor() {
        owner = msg.sender;
    }

    //그룹에 가입을 요청하는 것
    function requestMember(string memory _userDid) external{
        require(
            requesters[_userDid].count == 0,
            "Already request Member"
        );

        requesters[_userDid].count = 0;
        requesters[_userDid].isValid = false;
    }

    //상호인증
    function approveMember(string memory _approver, string memory _requester) external returns(bool){
        //상호인증하는 사람의 권한 확인
        require(
            requesters[_approver].isValid == true,
            "No permission"
        );
        //이미 승인 되었는지 확인
        require(
           requesters[_requester].isValid == false,
            "Alreay group member"
        );
        
        requesters[_requester].count++;
        
        if(requesters[_requester].count>=2){
            requesters[_requester].isValid = true;
        }
        return requesters[_requester].isValid;
    }

    function getVaild(string memory _requester) external view returns (bool){
        return requesters[_requester].isValid;
    }

    function setVaild(string memory _requester, bool _isValid) external{
        requesters[_requester].isValid = _isValid;
    }

    function getCount(string memory _requester) external view returns (uint){
        return requesters[_requester].count;
    }
}
