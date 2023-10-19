<script setup lang="ts">
import { showConfirmDialog, showNotify } from 'vant'
import { getLoginPost } from '@/utils/vote'
import { getQuestionList, submitAnswer } from '@/api'

const { currentRoute } = useRouter()
const { query } = unref(currentRoute)

// 用户作答信息
const answerObj = reactive([{}] as any)
const questionList = reactive([] as any)
const loginPost = getLoginPost()

const getStandard = (standard: string) => {
  const str = '\n'
  const arr = standard.split('#').filter(ele => Boolean(ele))
  let result = ''
  for (let i = 0; i < arr.length; i++)
    result += `${i + 1}、${arr[i]}${str}`

  return result.substring(
    0,
    result.length - str.length,
  )
}

const changeFlagObj = {} as any
const handleChange = (questionId: number) => {
  changeFlagObj[questionId] = true
}

const handleRadioClick = (questionId: number, objectiveFlag: number) => {
  if (objectiveFlag === 1) {
    window.setTimeout(() => {
      if (!changeFlagObj[questionId])
        Reflect.deleteProperty(answerObj[0], questionId)

      changeFlagObj[questionId] = false
      localStorage.setItem(`answerObj${loginPost.tenantId}${query.projectId}`, JSON.stringify(answerObj[0]))
    }, 0)
  } else {
    localStorage.setItem(`answerObj${loginPost.tenantId}${query.projectId}`, JSON.stringify(answerObj[0]))
  }
}

const onSubmit = () => {
  if (answerObj.length !== 0 && Object.keys(answerObj[0]).length > 0) {
    showConfirmDialog({
      title: '确定提交吗？',
      message: '提交评议后不可修改，请谨慎提交',
    }).then(() => {
      submitAnswer({
        userUniqueId: localStorage.getItem('userUniqueId'),
        loginPostId: loginPost.id,
        projectId: query.projectId,
        answerObj: answerObj[0],
        tenantId: loginPost.tenantId,
      }).then(() => {
        showNotify({
          type: 'success',
          message: '评议成功',
        })
        // 移出当前作答内容
        localStorage.removeItem(`answerObj${loginPost.tenantId}${query.projectId}`)
        history.back()
      })
    })
  } else {
    showNotify({
      type: 'danger',
      message: '评议项不能全部为空,请作答后提交',
    })
  }
}

const init = () => {
  if (!loginPost) {
    showNotify({
      type: 'danger',
      message: '请重新扫描二维码进入评议系统',
    })
    localStorage.clear()
  } else {
    getQuestionList({ tenantId: loginPost.tenantId, projectId: query.projectId }).then((data) => {
      questionList.length = 0
      if (data) {
        data.forEach((element) => {
          questionList.push(element)
          changeFlagObj[element.id] = true
        })

        const json = localStorage.getItem(`answerObj${loginPost.tenantId}${query.projectId}`)
        if (json)
          answerObj[0] = JSON.parse(json)
      }
    })
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <van-form @submit="onSubmit">
    <template v-for="(question) in questionList" :key="question.id">
      <van-cell-group v-if="question.objectiveFlag === 1" style="margin-top: 4px" inset>
        <van-field name="content" label="内容" :model-value="question.content" label-width="40" readonly />
        <van-field
          v-if="question.standard" name="standard" label="标准" :model-value="getStandard(question.standard)"
          rows="1" autosize type="textarea" readonly label-width="40"
        />

        <van-field label="选项" label-width="40">
          <template #input>
            <van-radio-group v-model="answerObj[0][question.id]" @change="handleChange(question.id)">
              <template v-for="(option, index) in JSON.parse(question.optionArr)" :key="index">
                <van-radio
                  style="padding-bottom: 16px" :name="option.value"
                  @click="handleRadioClick(question.id, question.objectiveFlag)"
                >
                  {{ option.label }}
                </van-radio>
              </template>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <van-cell-group v-if="question.objectiveFlag === 0" style="margin-top: 4px" inset>
        <van-field
          v-model="answerObj[0][question.id]" :name="`${question.id}`" :label="question.content" label-width="40"
          type="textarea" show-word-limit maxlength="200" rows="3"
          @update:model-value="handleRadioClick(question.id, question.objectiveFlag)"
        />
      </van-cell-group>
    </template>

    <div style="margin: 16px 16px">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<style scoped></style>
