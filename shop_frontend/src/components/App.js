import React, { Suspense } from 'react';
import { Routes, Route } from "react-router-dom"; // 화면 이동에 필요한 lib
import Auth from "../hoc/auth";

// pages for this product
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";
import Footer from "./views/Footer/Footer"
import UploadProductPage from "./views/UploadProductPage/UploadProductPage.js";
import DetailProductPage from "./views/DetailProductPage/DetailProductPage";
import CartPage from './views/CartPage/CartPage';
import HistoryPage from './views/HistoryPage/HistoryPage';



function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
        <Routes>

        {/* 엔드포인트 별 렌더링할 화면 지정
        option
        null    =>  아무나 출입이 가능한 페이지
        true    =>  로그인한 유저만 출입이 가능한 페이지
        false   =>  로그인한 유저는 출입 불가능한 페이지 */}

          <Route path="/" element={Auth(LandingPage, null)} />
          <Route path="/login" element={Auth(LoginPage, false)} />
          <Route path="/register" element={Auth(RegisterPage, false)} />
          <Route path="/product/upload" element={Auth(UploadProductPage, true)} />
          <Route path="/product/:productId" element={Auth(DetailProductPage, null)} />
          <Route path="/user/cart" element={Auth(CartPage, true)} />
          <Route path="/history" element={Auth(HistoryPage, true)} />

        </Routes>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
