<template>
  <div class="container mb-5 mt-5">
    <ModalWindow :id="'create-table'" @save="createCategory()">
      <input type="text" v-model="newCategoryName" class="form-control" />
    </ModalWindow>

    <h1 class="display-3 text-center mb-2">Меню</h1>
    <div class="d-flex flex-column align-items-center">
      <span
        class="text-muted d-block text-center"
        v-if="categories && categories.length === 0"
      >
        Меню пока пустое</span
      >
      <button
        @click="store.commit('setModalTitle', 'Введите название категории')"
        type="button"
        class="btn btn-secondary lead mb-4 mt-3"
        data-toggle="modal"
        data-target="#create-table"
      >
        Добавить категорию
      </button>
    </div>

    <TableItems
      v-for="item in categories"
      :key="item.id"
      :categoryId="item.id"
    ></TableItems>
  </div>
</template>

<script setup>
import { toRef, computed } from 'vue'
import TableItems from '@/components/TableItems.vue'
import ModalWindow from '@/components/ModalWindow.vue'
import { useStore } from 'vuex'

const store = useStore()
store.dispatch('getCategories')
const categories = toRef(store.state, 'categories')

const newCategoryName = computed({
  get() {
    return store.state.categoryName
  },
  set(value) {
    store.commit('setState', { property: 'categoryName', value })
  }
})

const createCategory = async () => {
  if (store.state.categoryName === '') return
  const category = await store
    .dispatch('sendReq', {
      method: 'post',
      url: 'category',
      body: { name: store.state.categoryName }
    })
    .then((res) => res.category)
  store.commit('addCategory', category)
}
</script>

<style lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display:
none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <--
Apparently some margin are still there even though it's hidden */
}

li {
  list-style-type: none;
}
</style>
