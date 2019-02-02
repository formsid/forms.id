<template>
  <d-navbar-nav class="border-left flex-row">
    <li class="nav-item border-right dropdown notifications">
      <a class="nav-link nav-link-icon text-center" v-d-toggle.notifications>
        <div class="nav-link-icon__wrapper">
          <i class="material-icons">&#xE7F4;</i>
          <d-badge pill >2</d-badge>
        </div>
      </a>
      <!-- <d-collapse id="notifications" class="dropdown-menu dropdown-menu-small">
        <d-dropdown-item>
          <div class="notification__icon-wrapper">
            <div class="notification__icon">
              <i class="material-icons">&#xE6E1;</i>
            </div>
          </div>
          <div class="notification__content">
            <span class="notification__category">Analytics</span>
            <p>Your website’s active users count increased by <span class="text-success text-semibold">28%</span> in the last week. Great job!</p>
          </div>
        </d-dropdown-item>
        <d-dropdown-item href="#">
          <div class="notification__icon-wrapper">
            <div class="notification__icon">
              <i class="material-icons">&#xE8D1;</i>
            </div>
          </div>
          <div class="notification__content">
            <span class="notification__category">Sales</span>
            <p>Last week your store’s sales count decreased by <span class="text-danger text-semibold">5.52%</span>. It could have been worse!</p>
          </div>
        </d-dropdown-item>
        <d-dropdown-item class="notification__all text-center">View all Notifications</d-dropdown-item>
      </d-collapse> -->
    </li>
    <li class="nav-item">
      <a class="h-100 d-flex align-items-center nav-link text-nowrap px-3">
        <img class="user-avatar rounded-circle mr-2" src="https://mantalabs.co/favicon.ico" alt="User Avatar">
        <span class="d-none d-md-inline-block">{{ user ? user.username : 'blockstacker' }}</span>
      </a>
    </li>
  </d-navbar-nav>
</template>

<script>
export default {
  store: ['user']
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
