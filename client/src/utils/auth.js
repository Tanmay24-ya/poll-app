export const getUserId = () => {
    let id = localStorage.getItem('poll_app_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('poll_app_user_id', id);
    }
    return id;
};
