<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="wedding-page column flex flex-center">

        <!-- Hero Section -->
        <div class="hero q-pa-lg column flex flex-center">
          <q-avatar size="80px" class="bg-pink-4 text-white shadow-4">
            <q-icon name="favorite" size="40px" />
          </q-avatar>
          <h1 class="text-h4 text-bold text-gold q-mt-md wedding-title">
            Валентина & Берк
          </h1>
          <div class="text-subtitle2 text-grey-9 q-mt-xs">
            💍 Свадбени спомени – 2025
          </div>
        </div>

        <!-- Upload Card -->
        <q-card flat bordered class="upload-card q-mt-xl q-pa-md">
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

            <!-- New Gallery Button -->
            <q-btn color="pink-6" text-color="white" label="Галерија" icon="photo_library" class="q-mt-sm"
              @click="goToGallery" />

            <input ref="fileInput" type="file" accept="image/*" multiple style="display: none" @change="previewFiles" />
          </q-card-section>

          <!-- Preview Grid -->
          <q-card-section v-if="previews.length > 0">
            <div class="row q-col-gutter-md justify-center">
              <div v-for="(src, index) in previews" :key="index" class="col-4 q-mb-md relative-position preview-img"
                :class="{ 'dimmed': index >= 20 }">
                <q-img :src="src" spinner-color="pink-6"
                  style="border-radius: 12px; height: 100px; object-fit: cover;" />
                <q-btn dense round flat color="negative" icon="close" size="sm" class="remove-btn"
                  @click="removeImage(index)" />
              </div>
            </div>

            <!-- Send Button -->
            <div class="text-center q-mt-md">
              <q-btn color="pink-6" text-color="white" label="Испрати слики" icon="send" @click="uploadFiles" />
            </div>
          </q-card-section>
        </q-card>

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

        <!-- Hearts Spinner + Progress Bar -->
        <div v-if="isUploading" class="overlay">
          <div class="loader-container column items-center">
            <div class="hearts-loader">
              <div class="heart" v-for="n in 3" :key="n" :style="{ animationDelay: (n - 1) * 0.3 + 's' }"></div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-container q-mt-md">
              <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <div class="text-caption text-pink-8 q-mt-xs">{{ Math.round(uploadProgress) }}%</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer q-mt-xl text-center">
          <p class="text-caption text-grey-6">
            Со љубов, <br />
            Валентина & Берк 💕
          </p>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const successDialog = ref(false);
const fileInput = ref(null);
const selectedFiles = ref([]);
const previews = ref([]);
const isUploading = ref(false);
const uploadProgress = ref(0);

const router = useRouter();

// Open file picker
function selectFiles() {
  fileInput.value.click();
}

// Navigate to gallery
function goToGallery() {
  router.push("/gallery");
}

// Generate previews
function previewFiles(event) {
  const files = Array.from(event.target.files);
  selectedFiles.value.push(...files);
  const newPreviews = files.map(f => URL.createObjectURL(f));
  previews.value.push(...newPreviews);
}

// Remove an image before upload
function removeImage(index) {
  selectedFiles.value.splice(index, 1);
  URL.revokeObjectURL(previews.value[index]);
  previews.value.splice(index, 1);
}

// Add image to event backend
async function addImageToEvent(eventName, imageUrl) {
  try {
    const res = await fetch("https://bojan.pythonanywhere.com/add_event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, ImageURL: imageUrl })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Unknown backend error");
    }
    const data = await res.json();
    console.log("Success:", data.message);
    return data.message;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

// Upload first 20 images
async function uploadFiles() {
  if (!selectedFiles.value.length) {
    alert("Ве молам, прво изберете некои слики.");
    return;
  }

  const filesToUpload = selectedFiles.value.slice(0, 20);
  const fileNames = filesToUpload.map(f => f.name);

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const res = await fetch(
      "https://mjvwsyxyzc.execute-api.eu-north-1.amazonaws.com/default/svadbaLambdaFunction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filenames: fileNames }),
      }
    );
    if (!res.ok) throw new Error("Неуспешно поврзување со серверот");
    const data = await res.json();

    let uploadedCount = 0;

    for (let idx = 0; idx < filesToUpload.length; idx++) {
      const file = filesToUpload[idx];
      const presignedUrl = data.urls[idx]?.upload_url;
      if (!presignedUrl) throw new Error(`Нема URL за ${file.name}`);

      try {
        const response = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (response.ok) {
          addImageToEvent("Svadba", file.name);
        } else {
          console.error(`Upload failed for ${file.name} with status ${response.status}`);
        }

        uploadedCount++;
        uploadProgress.value = (uploadedCount / filesToUpload.length) * 100;

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    successDialog.value = true;
    previews.value.forEach(url => URL.revokeObjectURL(url));
    previews.value = [];
    selectedFiles.value = [];
    fileInput.value.value = "";

  } catch (err) {
    console.error(err);
    alert("Неуспешно прикачување. Обидете се повторно.");
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
}
</script>

<style scoped>
.wedding-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #fff7f9, #fff0f5);
}

.hero {
  text-align: center;
}

.wedding-title {
  font-family: "Great Vibes", cursive;
  color: #b8860b;
}

.upload-card {
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.08);
}

.text-gold {
  color: #c9a43f;
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
