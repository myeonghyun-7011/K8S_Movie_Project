import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.removeItem('userId');
        // 강제로 상태 변경을 유도하여 리렌더링
        setTimeout(() => {
            navigate('/LoginForm');
        }, 100);
    }, [navigate]);

    return null;
};

export default Logout;
