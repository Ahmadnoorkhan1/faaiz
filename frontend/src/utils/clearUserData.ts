export const clearUserData = () => {
  // Clear local storage
  localStorage.removeItem('token');
  
  // Add any other user-related data that needs to be cleared
  localStorage.removeItem('lastRoute');
  localStorage.removeItem('preferences');
}; 