<template lang="pug">
  .min-h-screen.w-full.flex.flex-col.bg-khaki
    nav.border-t-8.border-formsid.w-full.bg-white.shadow-sm.py-4
      .container.flex.flex-col
        .w-full.flex.justify-between.items-center
          img.rounded-full.w-10.h-10(src="../assets/images/nav_logo.png")
          .ml-auto.flex.items-center
            //- i.material-icons.text-formsid.subtle.cursor-pointer.mr-4.relative(@click="toggleNotifications") &#xE7F4;
            //-   .absolute.rounded.h-0.subtle.bg-white.shadow-md.pin-r.w-64.z-max.mt-4(:class="{'pointer-events-auto opacity-100 max-h-64 h-auto' : notificationsVisible, 'pointer-events-none opacity-0 h-0' : !notificationsVisible}")
            //-     .flex.flex-col.w-full
            //-       .border-b.bg-formsid-pale.subtle(v-for="n in eligibleNotifications")
            //-         p.py-4.font-light.text-formsid-glass(v-if="n.type == 'response'") has received a new response.
            p.text-formsid.font-light.text-md.px-4.py-2.rounded.bg-formsid-clear {{ user ? user.username : 'blockstacker' }}
        .w-full.flex.justify-between.items-center.my-10
          h1.font-thin.text-formsid.py-2 {{ pageTitle }}
          .flex(v-if="$route.name == 'Forms'")
            div.flex.items-center.cursor-pointer.bg-formsid-clear.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded(@click="bus.$emit('openformeditor', null)")
              i.material-icons.text-lg.mr-2 create
              span Create
          .flex(v-if="$route.name == 'Form'")
            a.block.no-underline(:href="formPreview()" target="_blank" v-if="currentForm && currentForm.public")
              div.flex.items-center.cursor-pointer.border-formsid-clear.border.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded.mr-4
                i.material-icons.text-lg.mr-2 remove_red_eye
                span View
            div.flex.items-center.cursor-pointer.border-formsid-clear.border.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded.mr-4(@click="bus.$emit('exportdata', $route.params.id)")
              i.material-icons.text-lg.mr-2 cloud_download
              span Export Data
            div.flex.items-center.cursor-pointer.bg-formsid-clear.px-4.subtle.hover-bg-formsid.hover-text-white.font-light.text-formsid.py-3.rounded(@click="bus.$emit('openformeditor', $route.params.id)")
              i.material-icons.text-lg.mr-2 edit
              span Edit
        .w-full
        .flex
          //- router-link.flex.items-center.no-underline.px-4.subtle.hover-bg-formsid-clear.font-light.text-formsid.p-2.rounded.mr-6(:to="{ name: 'Dashboard' }" active-class="bg-formsid-clear" exact)
          //-   i.material-icons.text-lg.mr-2 dashboard
          //-   span Dashboard
          router-link.flex.items-center.no-underline.px-4.subtle.hover-bg-formsid-clear.font-light.text-formsid.p-2.rounded.mr-6(:to="{ name: 'Forms' }" active-class="bg-formsid-clear")
            i.material-icons.text-lg.mr-2 filter_none
            span Forms
          div.cursor-pointer.flex.items-center.no-underline.px-4.subtle.hover-bg-formsid-clear.font-light.text-formsid.p-2.rounded.mr-6(v-tooltip="{ content: 'Coming soon!', placement: 'top', trigger: 'hover' }")
            i.material-icons.text-xl.mr-2 poll
            span Polls
    router-view.py-8
</template>

<script lang="coffee">
  isDev = process.env.NODE_ENV is 'development'
  export default
    store: ['bus', 'collections', 'forms', 'user']
    data: ->
      notificationsVisible: false
    computed:
      unreadNotifications: -> (n for n in @user?.notifications when n.read is false)
      eligibleNotifications: -> (n for n in @user?.notifications when @forms?.indexOf(n.f) > -1)
      currentForm: ->
        found = (f for f in @collections.forms when f.id is @$route.params.id)[0] if @$route.name == 'Form'
        found
      pageTitle: ->
        title = @$route.name if @$route.name isnt 'Form'
        found = (f for f in @collections.forms when f.id is @$route.params.id)[0]
        title = found.title if @$route.name is 'Form' and found?
        title
      totalSubmissions: ->
        subs = @collections.forms.map (f) -> f.submissions.length
        subs.reduce (a, b) -> a + b
      totalViews: ->
        views = @collections.forms.map (f) -> f.views
        views.reduce (a, b) -> a + b
    methods:
      formPreview: ->
        prefix = if isDev is true then 'http://localhost:8081' else 'https://forms.id'
        "#{prefix}/f/#{@user.username}/#{@$route.params.id}"
      toggleNotifications: -> @notificationsVisible = !@notificationsVisible
</script>
