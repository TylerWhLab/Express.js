/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Menu, Badge } from 'antd';
import Icon from '@ant-design/icons';
import axios from 'axios';
import { USER_SERVER } from '../../../Config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function RightMenu(props) {
  const user = useSelector(state => state.user)
  const navigate = useNavigate();

  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        navigate('/login');
      } else {
        alert('로그아웃 실패')
      }
    });
  };

  if (user.userData && !user.userData.isAuth) {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="mail">
          <a href="/login">로그인</a>
        </Menu.Item>
        <Menu.Item key="app">
          <a href="/register">회원가입</a>
        </Menu.Item>
      </Menu>
    )
  } else {
    return (
      <Menu mode={props.mode}>

        {/* <Menu.Item key="history">
          <a href="/history">History</a>
        </Menu.Item> */}

        {/* 업로드 버튼 */}
        <Menu.Item key="upload">
          <a href="/product/upload">상품 올리기</a>
        </Menu.Item>

        {/* <Menu.Item key="cart" style={{ paddingBottom: 3 }}>
          <Badge count={user.userData && user.userData.cart.length}>
            <a href="/user/cart" className="head-example" style={{ marginRight: -22, color: '#667777' }} >
              <Icon type="shopping-cart" style={{ fontSize: 30, marginBottom: 3 }} />
            </a>
          </Badge>
        </Menu.Item> */}

        <Menu.Item key="logout">
          <a onClick={logoutHandler}>로그아웃</a>
        </Menu.Item>
        
      </Menu>
    )
  }
}

export default RightMenu;

