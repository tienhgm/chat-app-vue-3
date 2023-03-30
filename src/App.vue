<script setup lang="ts">
import { onMounted, ref } from "vue";
import socket from "./plugins/socket";
const username = ref("");
const isLoggedIn = ref<boolean>(false);
const users = ref<any>([]);
const isFlipped = ref(false);
function onToggleFlippedCard() {
  isFlipped.value = !isFlipped.value;
}
function onSubmitLogin() {
  isLoggedIn.value = true;
  socket.auth = { username: username.value };
  socket.connect();
}
onMounted(() => {
  socket.on("getUsers", (data: any) => {
    data.forEach((user: any) => {
      user.self = user.userId === socket.id;
    });
    console.log(data);
    users.value = data.sort((a: any, b: any) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
  });
  socket.on("userJustConnected", (data: any) => {
    users.value.push(data);
  });
});
</script>

<template>
  <!-- <form
    @submit.prevent="onSubmitLogin"
    class="flex justify-center mt-[3rem]"
    v-if="!isLoggedIn"
  >
    <input type="text" v-model="username" placeholder="username" />
    <button type="submit">Login</button>
  </form>
  <div class="grid grid-cols-12 gap-4 mt-[3rem]" v-else>
    <div class="col-span-3">
      <div class="text-xl font-bold">List user friend</div>
      <ul>
        <li v-for="user in users" :key="user.userId" class="flex items-center gap-1">
          <span>{{ user.username }}</span>
          <span class="inline-block w-1 h-1 rounded-full bg-green-500"></span>
        </li>
      </ul>
    </div>
    <div class="col-span-9">Chat workspace</div>
  </div> -->
  <div class="flex h-full justify-center">
    <div class="card" @click="onToggleFlippedCard">
      <div class="card__inner" :class="{ 'is-flipped': isFlipped }">
        <div class="card__face card__face--front">
          <div class="card__content">Front</div>
        </div>
        <div class="card__face card__face--back">
          <div class="card__content">Back</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  display: inline-block;
  &__inner {
    width: 150px;
    height: 200px;
    transition: transform 0.4s;
    transform-style: preserve-3d;
    cursor: pointer;
    position: relative;
  }
  &__inner.is-flipped {
    transform: rotateY(180deg);
  }
  &__face {
    position: absolute;
    width: 100%;
    height: 100%;
    //----------
    // quan trong
    backface-visibility: hidden;
    //-----------
    overflow: hidden;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 3px 10px 3px rgb(0, 0, 0, 0.2);
    &--back {
      background-color: #f3f3f3;
      transform: rotateY(-180deg);
    }
  }
}
</style>
