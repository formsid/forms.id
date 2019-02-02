<template>
  <div class="focus:outline-none focus:pb-2 focus:border-b-2 border-formsid" contenteditable="true" @input="update"></div>
</template>

<script>
export default {
  name: 'Editable',
  props: ['content'],
  mounted: function () {
    this.$el.innerText = this.content
  },
  methods: {
    update: function (event) {
      this.$emit('update', event.target.innerText)
    }
  }
}
</script>
