<template>
  <div class="focus:outline-none focus:pb-2 focus:border-b-2 border-formsid" contenteditable="true" @blur="$emit('update:content', $event.target.innerText)"></div>
</template>

<script>
export default {
  name: 'Editable',
  props: ['content'],
  mounted: function () {
    this.$el.innerText = this.content
  },
  watch: {
    content: function () {
      this.$el.innerText = this.content
    }
  }
}
</script>
