// 获取当前选择的职务
export const getLoginPost = () => {
  const loginPostJson = localStorage.getItem('loginPost')
  if (loginPostJson) {
    const loginPost = JSON.parse(loginPostJson)
    if (loginPost && loginPost.id > 0 && loginPost.name && loginPost.tenantId > 0)
      return loginPost
  }
  return null
}
