<script setup lang="ts">
import { showConfirmDialog, showFailToast } from 'vant'
import { loginPostList } from '@/api'

const deptName = ref('')
const loginPostName = ref()
const showPicker = ref(false)
const loginPostIds = ref([] as any)
const columns = ref([] as any)

// 获取路由参数deptId
const { push, currentRoute } = useRouter()
const { params } = unref(currentRoute)

const deptId = Number(params.deptId)
if (Number.isNaN(deptId) || deptId <= 0)
  showFailToast('二维码信息异常，请联系管理员')

const tenantCode = params.tenantCode

const loginPostArr = [] as any
const init = () => {
  // 获取该公司所有登录职位
  loginPostList({ tenantCode, deptId }).then((data) => {
    loginPostArr.length = 0
    if (data.length > 0) {
      deptName.value = data[0].dept.name

      data.forEach((item) => {
        columns.value.push({ text: item.name, value: item.id })
        loginPostArr.push(item)
      })
    } else {
      showFailToast('二维码信息异常，请联系管理员')
    }
  })
}

const noBomBox = () => {
  document.activeElement?.blur()
}

const onConfirm = ({ selectedOptions, selectedIndexes }) => {
  loginPostName.value = selectedOptions[0].text
  localStorage.setItem('loginPost', JSON.stringify(loginPostArr[selectedIndexes[0]]))
  showPicker.value = false
}

const handleSubmit = () => {
  showConfirmDialog({
    title: '确认职位选择',
    message: `请再次确认您的职位是否为${loginPostName.value}`,
  }).then(() => {
    push('/project')
  })
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="container">
    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          :model-value="deptName"
          label="公司名称"
          placeholder="公司名称"
          readonly
        />
        <van-field
          v-model="loginPostName"
          label="职位"
          required
          placeholder="请选择职位"
          :rules="[{ required: true, message: '请选择职位' }]"
          @click="showPicker = true"
          @focus="noBomBox"
        />
      </van-cell-group>
      <div style="padding: 16px">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
  <van-popup v-model:show="showPicker" round position="bottom">
    <van-picker
      v-model="loginPostIds"
      :columns="columns"
      @cancel="showPicker = false"
      @confirm="onConfirm"
    />
  </van-popup>
</template>

<style scoped lang="less">
.container {
  width: 100vw;
  height: 100vh;
  padding-top: 36vh;
  position: relative;
}
</style>
