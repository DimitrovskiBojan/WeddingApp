<template>
    <q-card flat bordered class="upload-card q-pa-md">
        <!-- Card Header -->
        <q-card-section>
            <div class="text-center">
                <q-icon name="photo_camera" size="40px" class="text-pink-6" />
                <h2 class="text-h6 text-bold q-mt-sm">Сподели слики</h2>
                <p class="text-body2 text-grey-7 q-mt-xs">
                    Твоите слики се дел од нашата приказна. Сподели ги со нас, за да ги помниме засекогаш.
                </p>
            </div>
        </q-card-section>

        <q-separator spaced />

        <!-- File Selector -->
        <q-card-section class="text-center">
            <q-btn color="pink-6" text-color="white" label="Избери слики" icon="photo_camera" @click="selectFiles" />
            <q-btn color="pink-6" text-color="white" label="Галерија" icon="photo_library" class="q-mt-sm"
                @click="$emit('go-gallery')" />
            <input ref="fileInput" type="file" accept="image/*" multiple style="display: none" @change="previewFiles" />
        </q-card-section>

        <!-- Preview Grid -->
        <q-card-section v-if="previews.length">
            <div class="row q-col-gutter-md justify-center">
                <div v-for="(src, index) in previews" :key="index" class="col-4 q-mb-md relative-position preview-img"
                    :class="{ dimmed: index >= 20 }">
                    <q-img :src="src" spinner-color="pink-6"
                        style="border-radius: 12px; height: 100px; object-fit: cover;" />
                    <q-btn dense round flat color="negative" icon="close" size="sm" class="remove-btn"
                        @click="removeImage(index)" />
                </div>
            </div>

            <div class="text-center q-mt-md">
                <q-btn color="pink-6" text-color="white" label="Испрати слики" icon="send" @click="uploadFiles" />
            </div>
        </q-card-section>

        <!-- Success Dialog -->
        <q-dialog v-model="successDialog">
            <q-card class="q-pa-md text-center">
                <q-card-section>
                    <q-icon name="check_circle" size="48px" class="text-green-6 q-mb-sm" />
                    <div class="text-h6 text-bold">Сликите се прикачени! 🎉</div>
                    <p class="text-body2 text-grey-8 q-mt-xs">
                        Ти благодариме што ги сподели твоите спомени со нас!
                    </p>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn flat color="pink-6" label="Затвори" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Upload Overlay -->
        <div v-if="isUploading" class="overlay">
            <div class="loader-container column items-center">
                <div class="hearts-loader">
                    <div class="heart" v-for="n in 3" :key="n" :style="{ animationDelay: (n - 1) * 0.3 + 's' }" />
                </div>

                <div class="progress-container q-mt-md">
                    <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <div class="text-caption text-pink-8 q-mt-xs">
                    {{ Math.round(uploadProgress) }}%
                </div>
            </div>
        </div>
    </q-card>
</template>

<script>
export default {
    name: "ImageUploader",
    props: {
        eventName: {
            type: String,
            default: "Event"
        }
    },
    data() {
        return {
            selectedFiles: [],
            previews: [],
            isUploading: false,
            uploadProgress: 0,
            successDialog: false
        };
    },
    methods: {
        selectFiles() {
            this.$refs.fileInput.click();
        },
        previewFiles(event) {
            const files = Array.from(event.target.files);
            this.selectedFiles.push(...files);
            this.previews.push(...files.map(f => URL.createObjectURL(f)));
        },
        removeImage(index) {
            URL.revokeObjectURL(this.previews[index]);
            this.selectedFiles.splice(index, 1);
            this.previews.splice(index, 1);
        },
        async addImageToEvent(eventName, imageUrl) {
            const res = await fetch("https://bojan.pythonanywhere.com/add_event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_name: eventName, ImageURL: imageUrl })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Backend error");
            }

            return res.json();
        },
        async uploadFiles() {
            if (!this.selectedFiles.length) {
                alert("Ве молам, прво изберете некои слики.");
                return;
            }

            const filesToUpload = this.selectedFiles.slice(0, 20);
            const fileNames = filesToUpload.map(f => f.name);

            this.isUploading = true;
            this.uploadProgress = 0;

            try {
                const res = await fetch(
                    "https://mjvwsyxyzc.execute-api.eu-north-1.amazonaws.com/default/svadbaLambdaFunction",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filenames: fileNames })
                    }
                );

                const data = await res.json();
                let uploaded = 0;

                for (let i = 0; i < filesToUpload.length; i++) {
                    const file = filesToUpload[i];
                    const url = data.urls[i]?.upload_url;

                    if (!url) continue;

                    const response = await fetch(url, {
                        method: "PUT",
                        headers: { "Content-Type": file.type },
                        body: file
                    });

                    if (response.ok) {
                        await this.addImageToEvent(this.eventName, file.name);
                    }

                    uploaded++;
                    this.uploadProgress = (uploaded / filesToUpload.length) * 100;
                }

                this.successDialog = true;
                this.previews.forEach(URL.revokeObjectURL);
                this.previews = [];
                this.selectedFiles = [];
                this.$refs.fileInput.value = "";

            } catch (err) {
                alert("Неуспешно прикачување. Обидете се повторно.");
                console.error(err);
            } finally {
                this.isUploading = false;
                this.uploadProgress = 0;
            }
        }
    }
};
</script>

<style scoped>
.upload-card {
    width: 90%;
    max-width: 400px;
    border-radius: 16px;
    box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.08);
}

.remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(255, 255, 255, 0.8);
    color: #e53935;
    font-size: 10px;
    z-index: 10;
}

.preview-img.dimmed {
    opacity: 0.4;
    filter: blur(1px);
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 240, 245, 0.9);
    backdrop-filter: blur(3px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
}

.hearts-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
}

.heart {
    margin-left: 15px;
    position: relative;
    width: 28px;
    height: 25px;
    background-color: #e91e63;
    transform: rotate(-45deg);
    animation: bump 1.8s infinite ease-in-out;
}

.heart::before,
.heart::after {
    content: '';
    position: absolute;
    width: 28px;
    height: 25px;
    background-color: #e91e63;
    border-radius: 50%;
}

.heart::before {
    top: -14px;
    left: 0;
}

.heart::after {
    left: 14px;
    top: 0;
}

@keyframes bump {

    0%,
    100% {
        transform: scale(1) rotate(-45deg);
    }

    25% {
        transform: scale(1.15) rotate(-45deg);
    }

    50% {
        transform: scale(1.05) rotate(-45deg);
    }

    75% {
        transform: scale(1.15) rotate(-45deg);
    }
}

.progress-container {
    width: 220px;
    height: 8px;
    background-color: #f8bbd0;
    border-radius: 8px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: #e91e63;
    transition: width 0.4s ease;
}
</style>
