<template>
  <div class="mb-5">
    <ModalWindow @save="editTable" :id="`edit-table-${categoryId}`">
      <input type="text" v-model="tableName" class="form-control" />
    </ModalWindow>
    <ModalWindow
      @close="updateToInit"
      @save="saveDishInfo"
      @update="updateDishInfo"
      :id="`dish-${categoryId}`"
    >
      <DishForm />
    </ModalWindow>
    <div class="d-flex justify-content-between align-items-center">
      <h3 class="display-4 mb-3 ml-4">{{ currentTableTitle }}</h3>
      <div class="btn-group mr-4">
        <button
          class="btn btn-light lead btn-table"
          data-toggle="modal"
          :data-target="`#edit-table-${categoryId}`"
          @click="store.commit('setModalTitle', 'Введите новое название')"
        >
          Редактировать категорию
        </button>
        <button
          class="btn btn-secondary lead btn-table"
          @click.prevent="deleteTable"
        >
          Удалить категорию
        </button>
      </div>
    </div>

    <table class="table mt-1">
      <thead class="thead-light">
        <tr>
          <th
            class="text-center"
            v-for="(title, index) in titlesArr"
            :key="index"
            scope="col"
          >
            <span class="font-weight-normal">{{ title }} </span>
          </th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data.dishes" :key="item.id">
          <td>{{ item.id }}</td>
          <td>
            <img
              class="table-image"
              v-if="item.imageName"
              :src="STORE_URL + '/' + item.imageName"
              alt="Не получилось загрузить изображение"
            />
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.weight }}</td>
          <td>
            <span
              v-show="ingredient"
              v-for="(ingredient, index) in item.ingredients"
              :key="ingredient.id"
              >{{
                `${ingredient.name}${
                  index === item.ingredients.length - 1 ? '' : ','
                } `
              }}</span
            >
          </td>
          <td>
            <p>{{ item.description }}</p>
          </td>
          <td>{{ item.enValue }}</td>
          <td>
            <div class="btn-group">
              <button
                class="btn btn-light lead"
                data-toggle="modal"
                :data-target="`#dish-${categoryId}`"
                @click="updateStoreForChanging(item.id)"
              >
                <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
                  />
                </svg>
              </button>
              <button
                class="btn btn-dark lead btn-del-dish"
                @click="deleteDish(item.id)"
              >
                <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex flex-column align-items-center">
      <span v-if="data.dishes && data.dishes.length === 0" class="text-muted"
        >В этой категории еще нет товаров</span
      >
      <button
        class="btn btn-secondary lead mt-3"
        data-toggle="modal"
        :data-target="`#dish-${categoryId}`"
        @click="updateStoreForCreating()"
      >
        Добавить шедевр кулинарии
      </button>
    </div>
  </div>
</template>
<script setup>
import ModalWindow from '@/components/ModalWindow.vue'
import DishForm from '@/components/DishForm.vue'
import { STORE_URL } from '@/config'

import { defineProps, ref, computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps(['categoryId'])
const store = useStore()
const titlesArr = [
  'ID',
  'Фото',
  'Название',
  'Цена, ₽',
  'Вес, г',
  'Ингредиенты',
  'Описание',
  'Ккал'
]

const currentTableTitle = computed(
  () => store.state.categories.find((item) => item.id === props.categoryId).name
)

const data = ref({ dishes: [] })
const tableName = ref('')
const getData = async () => {
  const res = await store
    .dispatch('getDishes', props.categoryId)
    .then((res) => res.category)
  data.value = res
  tableName.value = res.name
}
getData()
const deleteTable = async () => {
  const { id } = await store
    .dispatch('sendReq', {
      method: 'delete',
      url: `category/${props.categoryId}`
    })
    .then((res) => res.category)

  store.commit('deleteCategory', id)
}

const editTable = async () => {
  const category = await store
    .dispatch('sendReq', {
      method: 'put',
      url: `category/${props.categoryId}`,
      body: { name: tableName.value }
    })
    .then((res) => res.category)

  store.commit('editCategory', category)
}

const saveDishInfo = async () => {
  const imageName = await store
    .dispatch('upload')
    .then((res) => res.data.imageName)
  store.commit('setState', { property: 'imageModal', value: null })

  const body = Object.assign({}, store.state.modalData, { imageName })

  const res = await store.dispatch('sendReq', {
    method: 'post',
    url: 'dish',
    body
  })

  res && getData()
}

const updateDishInfo = async () => {
  const imageName = store.state.imageModal
    ? await store.dispatch('upload').then((res) => res.data.imageName)
    : store.state.modalData.imageName

  const body = Object.assign({}, store.state.modalData, {
    imageName
  })

  const deletedRes = await store.dispatch('sendReq', {
    method: 'delete',
    url: `ingredient/${store.state.modalData.id}`
  })
  if (deletedRes) {
    const res = await store.dispatch('sendReq', {
      method: 'put',
      url: `dish/${store.state.modalData.id}`,
      body
    })

    res && getData()
  }
}

const updateStoreForCreating = () => {
  store.commit('setModalTitle', 'Введите информацию о блюде')
  store.commit('setState', { property: 'imageModal', value: null })
  store.commit('setState', { property: 'modalStatus', value: 'creation' })
  store.commit('setModalData', {
    ingredients: [{ id: Date.now(), categoryId: props.categoryId }],
    categoryId: props.categoryId
  })
}

const updateStoreForChanging = async (id) => {
  store.commit('setModalTitle', 'Измените информацию о блюде')
  store.commit('setState', { property: 'imageModal', value: null })
  store.commit('setState', { property: 'modalStatus', value: 'changing' })

  const modalData = await store.dispatch('sendReq', {
    method: 'get',
    url: `dish/${id}`
  })

  if (modalData.ingredients && modalData.ingredients.length === 0) {
    Object.assign(modalData, {
      ingredients: [{ id: Date.now(), categoryId: props.categoryId }]
    })
  }

  store.commit('setModalData', modalData)
}

const updateToInit = () => {
  store.commit('setState', { property: 'formData', value: null })
  store.commit('setState', { property: 'imageModal', value: null })
  store.commit('setState', { property: 'modalStatus', value: 'hidden' })
  store.commit('setModalData', {})

  if (
    store.state.updatedIngredients &&
    store.state.updatedIngredients.length > 0
  ) {
    getData()
  }
}

const deleteDish = async (id) => {
  const res = await store.dispatch('sendReq', {
    method: 'delete',
    url: `dish/${id}`
  })

  if (res) {
    getData()
  }
}
</script>
<style>
.table-image {
  max-width: 100px;
}

.btn-table {
  height: 40px;
}

th {
  white-space: nowrap;
}

td {
  text-align: center;
}

.btn-del-dish {
  padding-top: 8px;
  padding-bottom: 4px;
}
</style>
