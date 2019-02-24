<template lang="pug">
  .root
    auth
    .min-h-screen.w-full.flex.flex-col.bg-khaki
      nav.border-t-8.border-formsid.w-full.bg-white.shadow-sm.py-4
        .container.flex.flex-col
          .w-full.flex.justify-between.items-center
            img.rounded-full.w-10.h-10(src="../assets/images/nav_logo.png")
            .ml-auto.flex.items-center
              i.material-icons.text-formsid.opacity-50.subtle.hover-opacity-90.cursor-pointer.mr-4 &#xE7F4;
              p.text-formsid.font-light.text-md.px-4.py-2.rounded.bg-formsid-clear forms.id
          .w-full.flex.justify-between.items-center.my-12
            h1.font-thin.text-formsid {{ pageTitle }}
            div.flex.items-center.cursor-pointer.bg-formsid-clear.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded
              i.material-icons.text-lg.mr-2 create
              span Create
          .w-full
          .flex
            router-link.flex.items-center.no-underline.px-4.subtle.hover-bg-formsid-clear.font-light.text-formsid.p-2.rounded.mr-6(:to="{ name: 'Dashboard' }" active-class="bg-formsid-clear" exact)
              i.material-icons.text-lg.mr-2 dashboard
              span Dashboard
            router-link.flex.items-center.no-underline.px-4.subtle.hover-bg-formsid-clear.font-light.text-formsid.p-2.rounded.mr-6(:to="{ name: 'Forms' }" active-class="bg-formsid-clear")
              i.material-icons.text-lg.mr-2 filter_none
              span Forms
            router-link.flex.items-center.no-underline.px-4.subtle.hover-bg-formsid-clear.font-light.text-formsid.p-2.rounded.mr-6(:to="{ name: 'Polls' }" active-class="bg-formsid-clear")
              i.material-icons.text-xl.mr-2 poll
              span Polls
      router-view.py-8
</template>

<script lang="coffee">
  import Auth from '../components/Auth.vue'
  export default
    store: ['collections']
    components: { Auth }
    data: -> { }
    computed:
      pageTitle: -> @$route.name
      totalSubmissions: ->
        subs = @collections.forms.map (f) -> f.submissions.length
        subs.reduce (a, b) -> a + b
      totalViews: ->
        views = @collections.forms.map (f) -> f.views
        views.reduce (a, b) -> a + b
</script>

<style scoped>

</style>
