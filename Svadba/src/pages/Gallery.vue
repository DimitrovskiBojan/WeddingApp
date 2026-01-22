<template>
    <q-page>
        <q-page class="q-pa-md gallery-wrapper">
            <!-- Password Dialog -->
            <q-dialog v-model="showPasswordDialog" persistent>
                <q-card class="upload-card">
                    <q-card-section>
                        <div class="text-h5 text-gold elegant-font">Внесете лозинка</div>
                        <q-input v-model="passwordInput" type="password" label="Лозинка" autofocus
                            @keyup.enter="checkPassword" />
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn color="pink-6" label="Потврди" @click="checkPassword" />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <!-- Loading -->
            <div v-if="loading" class="overlay flex flex-center">
                <div class="loader-container">
                    <q-spinner color="pink-6" size="50px" />
                    <div class="text-caption text-pink">Се вчитува...</div>
                </div>
            </div>

            <!-- Empty -->
            <div v-else-if="images.length === 0" class="text-center text-grey-7 q-mt-xl elegant-font text-pink">
                Нема слики за овој настан.
            </div>

            <!-- Image Grid -->
            <div v-else class="grid-container">
                <div v-for="(img, index) in images" :key="index" class="image-box" @click="openDialog(img, index)">
                    <q-img :src="img" ratio="1" spinner-color="pink-6" class="gallery-img" loading="lazy" />
                </div>
            </div>

            <q-dialog v-model="showDialog">
                <q-card class="column full-height">

                    <q-card-section class="q-pa-none col">
                        <q-carousel v-model="slide" animated arrows navigation infinite swipeable class="full-height">
                            <q-carousel-slide v-for="(img, index) in images" :key="index" :name="index"
                                class="flex flex-center">
                                <img :src="img" class="carousel-image" />
                            </q-carousel-slide>
                        </q-carousel>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions align="right">
                        <q-btn flat label="Close" color="primary" @click="showDialog = false" />
                        <q-btn flat icon="download" label="Download" color="primary"
                            @click="downloadImage(images[slide])" />
                    </q-card-actions>

                </q-card>
            </q-dialog>
        </q-page>
    </q-page>
</template>

<script>

export default {
    name: "EventImages",

    data() {
        return {
            images: [],
            loading: false,
            showDialog: false,
            selectedImage: null,
            eventName: "Svadba",
            showPasswordDialog: true,
            passwordInput: "",
            slide: 20
        };
    },

    methods: {
        checkPassword() {
            if (this.passwordInput === "5879") {
                this.showPasswordDialog = false;
                this.fetchImages();
            } else {
                this.$q.notify({ type: 'negative', message: 'Лозинката е погрешна!' });
                this.passwordInput = "";
            }
        },

        async fetchImages() {
            this.loading = true;

            try {
                const res1 = await fetch("https://bojan.pythonanywhere.com/event_images", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event_name: this.eventName })
                });

                if (!res1.ok) throw new Error("Server error fetching filenames");

                const filenames = await res1.json();
                if (!Array.isArray(filenames) || filenames.length === 0) {
                    this.images = [];
                    return;
                }

                const res2 = await fetch("https://zv64flpith.execute-api.eu-north-1.amazonaws.com/default/get-urls-function", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ filenames })
                });

                if (!res2.ok) throw new Error("Server error fetching URLs");

                const data = await res2.json();
                this.images = data.urls.map(x => x.get_url);

            } catch (err) {
                console.error("Error loading images:", err);
            } finally {
                this.loading = false;
            }
        },

        openDialog(img, index) {
            this.slide = index;
            this.selectedImage = img;
            this.showDialog = true;
        },

        async downloadImage(url) {
            const response = await fetch(url, { mode: 'cors' })
            const blob = await response.blob()

            const objectUrl = URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = objectUrl
            link.download = url.split('/').pop() || 'image.jpg'
            document.body.appendChild(link)
            link.click()

            document.body.removeChild(link)
            URL.revokeObjectURL(objectUrl)
        }
    }
};
</script>

<style scoped>
.gallery-wrapper {
    max-width: 960px;
    margin: auto;
}

.elegant-font {
    font-family: "Great Vibes", cursive;
}

.text-gold {
    color: #b8860b;
}

.text-pink {
    color: #e91e63;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 24px;
}

.image-box {
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.image-box:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
}

.gallery-img {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.full-img-container {
    width: 100%;
    height: 94%;
    display: flex;
    justify-content: center;
    align-items: center;
}


.carousel-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
