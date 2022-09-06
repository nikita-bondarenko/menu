import { createStore } from 'vuex'
import axios from 'axios'
import { BASE_URL } from '@/config'

export default createStore({
  state: {
    titlesArr: [
      'ID',
      'Изображение',
      'Название',
      'Стоимость',
      'Вес',
      'Ингредиенты',
      'Описание',
      'Энергетическая ценность'
    ],
    categories: null,
    modalTitle: null,
    categoryName: '',
    modalData: {}
  },
  getters: {},
  mutations: {
    setModalTitle(state, title) {
      state.modalTitle = title
    },
    setModalData(state, data) {
      state.modalData = data
    },
    setState(state, { property, value }) {
      state[property] = value
    },
    addCategory(state, category) {
      state.categories.push(category)
    },
    deleteCategory(state, id) {
      state.categories = state.categories.filter((item) => item.id !== id)
    },
    editCategory(state, { id, name }) {
      const category = state.categories.find((item) => item.id === id)
      const index = state.categories.indexOf(category)
      const categories = state.categories
      categories.splice(index, 1, {
        id,
        name
      })
      state.categories = categories
    }
  },
  actions: {
    async sendReq(context, { method, url, body }) {
      const res = await axios[method](`${BASE_URL + '/' + url}`, {
        ...body
      }).then((res) => res.data)
      return res
    },
    async getCategories(context) {
      const res = await axios.get(`${BASE_URL}/category`)
      context.state.categories = res.data.categories
    },
    async getDishes(context, id) {
      const res = await axios.get(`${BASE_URL}/category/${id}`)
      return res.data
    },
    async deleteCategory(context, id) {
      try {
        const res = await axios.delete(`${BASE_URL}/category/${id}`)
        return res.data
      } catch (err) {
        console.log(err)
      }
      const categories = context.state.categories
      context.state.categories = categories.filter((item) => item.id !== id)
    },
    async upload(context) {
      const res = axios.post(`${BASE_URL}/upload`, context.state.formData, {
        'Content-Type': 'multipart/form-data'
      })
      return res
    }
  },
  modules: {}
})
