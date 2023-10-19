<script setup lang="ts">
import { showConfirmDialog, showDialog, showNotify } from 'vant'
import { getLoginPost } from '@/utils/vote'
import { getProjectPersonList, getQuestionList, submitAnswer } from '@/api'

const { currentRoute } = useRouter()
const { query } = unref(currentRoute)

const answerObj = reactive([{} as any] as any)
const questionList = reactive([] as any)
const personList = reactive([] as any)
const loginPost = getLoginPost()

const changeFlagObj = {} as any

const openStandardModal = (item) => {
  if (item.standard) {
    const arr = item.standard.split('#').filter((str: string) => Boolean(str))
    let message = ''
    for (let i = 0; i < arr.length; i++)
      message += `${i + 1}、${arr[i]}\n`

    showDialog({
      title: item.content,
      message,
      messageAlign: 'left',
    })
  }
}

const handleChange = (k: string) => {
  const questionId = k.split('-')[0]
  changeFlagObj[questionId] = true
}

const handleOptionClick = (k: string) => {
  const questionId = k.split('-')[0]
  window.setTimeout(() => {
    if (!changeFlagObj[questionId])
      Reflect.deleteProperty(answerObj[0], k)

    changeFlagObj[questionId] = false
    localStorage.setItem(
      `answerObj${loginPost.Id}${query.projectId}`,
      JSON.stringify(answerObj[0]),
    )
  }, 0)
}

const handleSubmit = () => {
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
    getProjectPersonList({ projectId: query.projectId }).then((data) => {
      personList.length = 0
      if (data) {
        data.forEach((person) => {
          personList.push(person)
        })
      }
    })

    getQuestionList({ tenantId: loginPost.tenantId, projectId: query.projectId }).then((data) => {
      questionList.length = 0
      if (data) {
        data.forEach((question) => {
          questionList.push(question)
          changeFlagObj[question.id] = false
        })
      }
    })

    const json = localStorage.getItem(`answerObj${query.projectId}`)
    if (json)
      answerObj[0] = JSON.parse(json)
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <van-form @submit="handleSubmit">
    <template v-for="(person, personIndex) in personList" :key="personIndex">
      <van-cell-group style="margin-top: 4px" inset>
        <van-field label="姓名" label-width="40" readonly>
          <template #input>
            <span style="font-weight: bolder; width: 60px; line-height: normal">
              {{ person.name }}
            </span>
            <span>({{ person.postSet.map(item => item.name).join(' ') }})</span>
          </template>
        </van-field>
        <van-field label="部门" label-width="40" readonly :model-value="person.dept?.name" />

        <!-- 德能勤绩廉综合评价 -->
        <table style="margin: 0; border-spacing: 0">
          <thead>
            <tr>
              <th :style="{ width: `${10}%` }" />
              <th
                v-for="(question, index) in questionList" :key="index" style="padding: 0 3%"
                @click="openStandardModal(question)"
              >
                {{ question.content }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(option, optionIndex) in JSON.parse(questionList[0].optionArr)" :key="optionIndex">
              <td :style="{ width: `${10}%` }">
                {{ option.label }}
              </td>
              <td
                v-for="(question, itemIndex) in questionList" :key="itemIndex" :style="{
                  width:
                    itemIndex === questionList.length - 1 ? `${15}%` : `${15}%`,
                  borderLeft: itemIndex === 0 ? '1px solid #e8e8e8' : '',
                  borderRight:
                    itemIndex === questionList.length - 1
                      ? ''
                      : '1px solid #e8e8e8',
                }"
              >
                <van-radio-group
                  v-model="answerObj[0][`${question.id}-${person.id}`]"
                  @change="handleChange(`${question.id}-${person.id}`)"
                >
                  <van-radio :name="option.value" @click="handleOptionClick(`${question.id}-${person.id}`)" />
                </van-radio-group>
              </td>
            </tr>
          </tbody>
        </table>
      </van-cell-group>
    </template>

    <div style="margin: 16px 16px">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<style scoped>
:deep(.van-radio__icon) {
  margin: 0 auto !important;
}

tr {
  height: 40px;
}

:deep(.van-field__control--custom) {
  align-items: flex-start;
}
</style>
