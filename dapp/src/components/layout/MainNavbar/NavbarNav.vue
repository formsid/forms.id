<template>
  <d-navbar-nav class="border-left flex-row">
    <li class="nav-item border-right dropdown notifications" v-if="user">
      <a class="nav-link nav-link-icon text-center" v-d-toggle.notifications @click="notificationsShown">
        <div class="nav-link-icon__wrapper" >
          <i class="material-icons">&#xE7F4;</i>
          <d-badge pill>{{ unreadNotifications.length }}</d-badge>
        </div>
      </a>
      <d-collapse id="notifications" class="dropdown-menu dropdown-menu-small">
        <d-dropdown-item v-for="n in eligibleNotifications" :key="n.id">
          <div class="notification__icon-wrapper">
            <div class="notification__icon">
              <i class="material-icons">&#xE6E1;</i>
            </div>
          </div>
          <div class="notification__content">
            <span class="notification__category" v-if="n.type == 'response'">Response</span>
            <p>You received a new response on {{ formTitleForId(n.f) }}</p>
          </div>
        </d-dropdown-item>
      </d-collapse>
    </li>
    <li class="nav-item">
      <a class="h-100 d-flex align-items-center nav-link text-nowrap px-3">
        <!-- <img class="user-avatar rounded-circle mr-2" src="https://mantalabs.co/favicon.ico" alt="User Avatar"> -->
        <span class="d-none d-md-inline-block">{{ user ? user.username : 'blockstacker' }}</span>
      </a>
    </li>
  </d-navbar-nav>
</template>

<script>
export default {
  store: ['user', 'forms', 'collections'],
  computed: {
    unreadNotifications(){
      return this.user && this.user.notifications.length
        ? this.user.notifications.filter(n => !n.read)
        : []
    },
    eligibleNotifications(){
      return this.user.notifications.filter(n => this.forms.indexOf(n.f) > -1)
    }
  },
  methods: {
    formTitleForId(id){
      return this.forms.find(f => f == id)
        ? this.collections.forms.find(f => f.id == id).title
        : ''
    },
    notificationsShown(){
      if(this.unreadNotifications.length){
        setTimeout(() => {
          this.user.notifications.forEach(n => n.read = true)
          blockstack.putFile(`notifications.json`, JSON.stringify(this.user.notifications), { encrypt : true })
        }, 700)
      }
    }
  }
}
</script>

<style>
  .nav-link:hover {
    cursor: pointer;
  }
  .user-avatar {
    width: 32px;
    height: 32px;
  }
</style>
