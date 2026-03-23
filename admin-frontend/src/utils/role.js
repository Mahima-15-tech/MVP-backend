export const getAdmin = () => {
    return JSON.parse(localStorage.getItem("admin"));
  };
  
  export const isSuperAdmin = () => {
    return getAdmin()?.role === "SUPER_ADMIN";
  };