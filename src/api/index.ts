import http from '@/utils/http/index'

export const loginPostList = (params): any => {
  return http.post('/common/loginPost/list', params)
}

export const getProjectCategoryList = (params): any => {
  return http.post('/common/project/getProjectCategoryList', params)
}

export const getProjectList = (params): any => {
  return http.post('/common/project/getProjectList', params)
}

export const getQuestionList = (params): any => {
  return http.post('/common/question/list', params)
}

export const submitAnswer = (params): any => {
  return http.post('/common/project/submitAnswer', params)
}

export const getProjectPersonList = (params): any => {
  return http.post('/common/person/list', params)
}
