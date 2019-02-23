<template>
  <d-container fluid class="main-content-container px-4 pb-4">
    <!-- Error -->
    <div class="error">
      <div class="error__content">
        <h2>404</h2>
        <h3 class="mb-4">We couldn't find this page!</h3>
        <d-button pill @click="$router.go(-1)">&larr; Go Back</d-button>
      </div>
    </div>
  </d-container>
</template>
