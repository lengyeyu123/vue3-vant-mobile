<script setup lang="ts">
import { showNotify } from 'vant'
import { getUUID } from '@/utils/UUID'
import { getLoginPost } from '@/utils/vote'
import { getProjectList } from '@/api'

const props = defineProps<{ projectCategoryCode: number }>()

const { push } = useRouter()

const list = ref([] as any)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const onLoad = () => {
  // 用户唯一标识
  const userUniqueId = localStorage.getItem('userUniqueId')

  // 是否处于加载状态
  refreshing.value = true
  // 清空页面数据
  list.value.length = 0

  const loginPost = getLoginPost()
  if (!loginPost) {
    refreshing.value = false
    finished.value = true
    loading.value = false
    showNotify({
      type: 'danger',
      message: '请重新扫描二维码进入评议系统',
    })
    localStorage.clear()
  } else {
    getProjectList({ loginPostId: loginPost.id, tenantId: loginPost.tenantId, userUniqueId, projectCategoryCode: props.projectCategoryCode }).then((data) => {
      if (data) {
        data.forEach((element) => {
          list.value.push(element)
        })
      }
      refreshing.value = false
      finished.value = true
      loading.value = false
    })
  }
}

const onRefresh = () => {
  // 清空列表数据
  finished.value = false

  // 重新加载数据
  // 将loading设置为true 表示处于加载状态
  loading.value = true
  onLoad()
}

const handleClick = (project) => {
  if (project.completeStatus) {
    showNotify({
      type: 'warning',
      message: '已完成评议，请勿重复进入',
    })
    return
  }
  if (project.type === 0) {
    // 组织
    push({ path: '/organization', query: { projectId: project.id } })
  } else {
    push({ path: '/person', query: { projectId: project.id } })
  }
}
</script>

<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-cell v-for="item in list" :key="item" :value="item.deptList" is-link @click="handleClick(item)">
        <template #title>
          <span class="custom-title">{{ item.name }}</span>
        </template>
        <template #label>
          <van-tag :type="item.completeStatus ? 'success' : 'warning'">
            {{ item.completeStatus ? '已完成' : '未完成' }}
          </van-tag>
          {{ item.deptSet.map(dept => dept.name).join(' ') }}
        </template>
      </van-cell>
    </van-list>
  </van-pull-refresh>
</template>

<style scoped></style>
