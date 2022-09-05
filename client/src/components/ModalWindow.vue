<template>
  <teleport to="#teleport">
    <div
      class="modal fade"
      :id="props.id"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden="true"
      ref="modal"
    >
      <div
        ref="container"
        class="modal-dialog modal-dialog-centered"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">
              {{ store.state.modalTitle }}
            </h5>
            <button
              type="button"
              class="close lead"
              data-dismiss="modal"
              aria-label="Close"
              @click="emit('close')"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <div class="btn-group">
              <button
                type="button"
                @click="save"
                data-dismiss="modal"
                class="btn btn-light lead"
              >
                Сохранить изменения
              </button>

              <button
                type="button"
                class="btn btn-secondary lead"
                data-dismiss="modal"
                @click="emit('close')"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup>
import { useStore } from 'vuex'
import { defineEmits, defineProps, onMounted, ref } from 'vue'
const store = useStore()
const props = defineProps(['id'])
const emit = defineEmits(['save', 'close', 'update'])
const save = () =>
  store.state.modalStatus === 'changing' ? emit('update') : emit('save')

const modal = ref(null)
const container = ref(null)

onMounted(() => {
  const arr = Array.from([modal, container])
  arr.forEach((element) => {
    element.value.addEventListener(
      'click',
      (event) => {
        if (event.target === modal.value) {
          event.stopPropagation()
          if (event.currentTarget === modal.value) {
            emit('close')
          }
        }
      },
      { capture: false }
    )
  })
})
</script>
<style></style>
