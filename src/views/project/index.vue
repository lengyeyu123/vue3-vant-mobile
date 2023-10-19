<script setup lang="ts">
import { showNotify } from 'vant'
import { ref } from 'vue'
import ProjectList from '../components/ProjectList.vue'
import { getProjectCategoryList } from '@/api'
import { getLoginPost } from '@/utils/vote'

const projectCategoryArr = ref([] as any)
const active = ref()

const init = () => {
  const loginPost = getLoginPost()
  if (!loginPost) {
    showNotify({
      type: 'danger',
      message: '请重新扫描二维码进入评议系统',
    })
    localStorage.clear()
    return
  }

  // 获取 tab 名称列表
  getProjectCategoryList({ tenantId: loginPost.tenantId, loginPostId: loginPost.id }).then((data) => {
    if (data) {
      projectCategoryArr.value.length = 0
      data.forEach((element) => {
        projectCategoryArr.value.push(element)
      })
      if (projectCategoryArr.value.length > 0)
        active.value = projectCategoryArr.value[0].code
    }
  })
}
onMounted(() => {
  init()
})
</script>

<template>
  <van-tabs v-model:active="active" swipeable sticky>
    <van-tab
      v-for="(item, index) in projectCategoryArr" :key="index" :index="item.code" :title="item.value"
      :name="item.code"
    >
      <ProjectList :project-category-code="Number(item.code)" />
    </van-tab>
  </van-tabs>
</template>

<style scoped></style>
