<template>
    <q-layout view="lHh Lpr lFf">
        <!-- Header -->
        <q-header elevated class="bg-pink-7 text-white">
            <q-toolbar>
                <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
                <q-toolbar-title>
                    Evently
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <!-- Left Drawer / Sidebar -->
        <q-drawer v-model="drawer" show-if-above :width="200" :breakpoint="400">
            <q-scroll-area style="height: calc(100% - 210px); margin-top: 150px; border-right: 1px solid #ddd">
                <q-list padding>
                    <q-item clickable v-ripple to="/" active-class="text-pink-7">
                        <q-item-section avatar>
                            <q-icon name="photo_camera" color="pink-7" />
                        </q-item-section>

                        <q-item-section>
                            Upload image
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple to="/gallery">
                        <q-item-section avatar>
                            <q-icon name="photo_library" color="pink-7" />
                        </q-item-section>

                        <q-item-section>
                            Gallery
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>

            <q-img class="absolute-top q-mt-md" src="/icons/eventlyy.png">

            </q-img>
            <q-item clickable v-ripple>
                <q-item-section avatar>
                    <q-icon name="language" color="pink-7" />
                </q-item-section>

                <q-item-section>
                    English
                </q-item-section>
            </q-item>
        </q-drawer>

        <!-- Page container -->
        <q-page-container>
            <router-view />
        </q-page-container>



    </q-layout>
</template>

<script>
export default {
    name: 'MainLayout',

    data() {
        return {
            drawer: false
        }
    },

    methods: {
        toggleLeftDrawer() {
            this.drawer = !this.drawer
        }
    }
}
</script>
