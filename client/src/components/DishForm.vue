<template>
  <form action="">
    <div class="form-group">
      <div class="text-center">
        <img
          class="rounded img-fluid"
          v-if="isDishChanging && !store.state.imageModal && data.imageName"
          :src="STORE_URL + '/' + data.imageName"
          alt="Не удалось загрузить изображение"
        />
        <img
          class="rounded img-fluid"
          v-if="store.state.imageModal"
          :src="store.state.imageModal"
          alt="Не удалось загрузить изображение"
        />
      </div>
      <label for="exampleFormControlFile1">Изображение</label>
      <input
        @change="handleImage"
        type="file"
        class="form-control-file"
        id="exampleFormControlFile1"
        accept="image/*"
      />
    </div>
    <div class="form-group">
      <label for=""> Название</label>
      <input class="form-control" type="text" v-model.trim="data.name" />
    </div>
    <div class="form-group">
      <label for=""> Вес порции</label>
      <input class="form-control" type="number" v-model="data.weight" />
    </div>

    <div class="form-group">
      <label for=""> Цена в рублях</label>
      <input class="form-control" type="number" v-model="data.price" />
    </div>

    <div class="form-group">
      <label for=""> Енергия, Ккал</label>
      <input class="form-control" type="number" v-model="data.enValue" />
    </div>
    <div class="form-group">
      <label for=""> Ингредиенты</label>
      <ul class="list-group">
        <li
          class="list-group-flush"
          v-for="item in data.ingredients"
          :key="item.id"
        >
          <div class="form-milti-input">
            <input
              class="form-control mb-3"
              type="text"
              v-model.trim="item.name"
            />
            <button
              v-if="data.ingredients.length > 1"
              class="btn btn-secondary lead btn-delete"
              @click.prevent="deleteIngredient(item.id)"
            >
              Удалить
            </button>
          </div>
        </li>
      </ul>
      <button class="btn btn-light lead" @click.prevent="addIngredient">
        Добавить ингредиент
      </button>
    </div>
    <div class="form-group">
      <label for=""> Описание превосходных качеств</label>
      <textarea
        id=""
        cols="30"
        rows="10"
        v-model.trim="data.description"
        class="form-control"
      ></textarea>
    </div>
  </form>
</template>
<script setup>
import { STORE_URL } from '@/config'
import { useStore } from 'vuex'
import { computed } from 'vue'
const store = useStore()

const isDishChanging = computed(() => store.state.modalStatus === 'changing')

const data = computed({
  get() {
    return store.state.modalData
  },
  set(value) {
    store.commit('setModalData', value)
  }
})

const createBase64Image = (fileObject) => {
  const reader = new FileReader()

  reader.onload = (e) => {
    store.commit('setState', { property: 'imageModal', value: e.target.result })
  }
  reader.readAsDataURL(fileObject)
}

const handleImage = (e) => {
  const selectedImage = e.target.files[0]
  const formData = new FormData()
  formData.append('image', selectedImage)
  store.commit('setState', { property: 'formData', value: formData })
  createBase64Image(selectedImage)
}

const deleteIngredient = (id) => {
  const ingredients = data.value.ingredients.filter((item) => item.id !== id)
  data.value.ingredients = ingredients
}

const addIngredient = () => {
  const ingredients = store.state.modalData.ingredients

  const id = Date.now()

  const ingredient = { categoryId: data.value.categoryId, id }
  ingredients.push(ingredient)

  data.value.ingredients = ingredients
}
</script>
<style>
.form-milti-input {
  position: relative;
}

.btn-delete {
  position: absolute;
  right: 0;
  top: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}
</style>
