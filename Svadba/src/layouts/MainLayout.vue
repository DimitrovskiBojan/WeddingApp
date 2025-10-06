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
            Valentina & Berk
          </h1>
          <div class="text-subtitle2 text-grey-9 q-mt-xs">
            💍 Wedding Memories – 2025
          </div>
        </div>

        <!-- Upload Card -->
        <q-card flat bordered class="upload-card q-mt-xl q-pa-md">
          <q-card-section>
            <div class="text-center">
              <q-icon name="photo_camera" size="40px" class="text-pink-6" />
              <h2 class="text-h6 text-bold q-mt-sm">Share Your Photos</h2>
              <p class="text-body2 text-grey-7 q-mt-xs">
                Upload the moments you captured so we can keep this day alive forever
              </p>
            </div>
          </q-card-section>

          <q-separator spaced />

          <!-- File Selector -->
          <q-card-section class="text-center">
            <q-btn color="pink-6" text-color="white" label="Select Photos" icon="photo_camera" @click="selectFiles" />
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
              <q-btn color="pink-6" text-color="white" label="Send Photos" icon="send" @click="uploadFiles" />
            </div>
          </q-card-section>
        </q-card>

        <!-- Success Dialog -->
        <q-dialog v-model="successDialog">
          <q-card class="q-pa-md text-center">
            <q-card-section>
              <q-icon name="check_circle" size="48px" class="text-green-6 q-mb-sm" />
              <div class="text-h6 text-bold">Upload Successful 🎉</div>
              <p class="text-body2 text-grey-8 q-mt-xs">
                Thank you for sharing your photos with Valentina & Berk’s album!
              </p>
            </q-card-section>
            <q-card-actions align="center">
              <q-btn flat color="pink-6" label="Close" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- 3 Bumping Hearts Spinner -->
        <div v-if="isUploading" class="overlay">
          <div class="hearts-loader">
            <div class="heart" v-for="n in 3" :key="n" :style="{ animationDelay: (n - 1) * 0.3 + 's' }"></div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer q-mt-xl text-center">
          <p class="text-caption text-grey-6">
            With love, <br />
            Valentina & Berk 💕
          </p>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";

const successDialog = ref(false);
const fileInput = ref(null);
const selectedFiles = ref([]);
const previews = ref([]);
const isUploading = ref(false);

// Open file picker
function selectFiles() {
  fileInput.value.click();
}

// Generate previews and enforce limit
function previewFiles(event) {
  const files = Array.from(event.target.files);
  const newFiles = files.map(f => f);
  selectedFiles.value.push(...newFiles);
  const newPreviews = newFiles.map(f => URL.createObjectURL(f));
  previews.value.push(...newPreviews);
}

// Remove an image before upload
function removeImage(index) {
  selectedFiles.value.splice(index, 1);
  URL.revokeObjectURL(previews.value[index]);
  previews.value.splice(index, 1);
}

// Upload only the first 20 images
async function uploadFiles() {
  if (!selectedFiles.value.length) {
    alert("Please select some photos first.");
    return;
  }

  const filesToUpload = selectedFiles.value.slice(0, 20);
  const fileNames = filesToUpload.map(f => f.name);

  isUploading.value = true; // show hearts spinner

  try {
    const res = await fetch(
      "https://mjvwsyxyzc.execute-api.eu-north-1.amazonaws.com/default/svadbaLambdaFunction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filenames: fileNames,
          content_type: filesToUpload[0].type,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to get presigned URLs");
    const data = await res.json();

    await Promise.all(
      filesToUpload.map(async (file, idx) => {
        const presignedUrl = data.urls[idx]?.upload_url;
        if (!presignedUrl) throw new Error(`No presigned URL for ${file.name}`);
        await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "x-amz-server-side-encryption": "AES256",
          },
          body: file,
        });
      })
    );

    successDialog.value = true;
    previews.value.forEach(url => URL.revokeObjectURL(url));
    previews.value = [];
    selectedFiles.value = [];
    fileInput.value.value = "";

  } catch (err) {
    console.error(err);
    alert("Upload failed. Please try again.");
  } finally {
    isUploading.value = false;
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

/* Remove button styling */
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.8);
  color: #e53935;
  font-size: 10px;
  z-index: 10;
}

/* Dim extra images beyond limit */
.preview-img.dimmed {
  opacity: 0.4;
  filter: blur(1px);
}

/* === Full-screen overlay === */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 240, 245, 0.9);
  backdrop-filter: blur(3px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
  /* disable clicks */
}

/* === 3 Bumping Hearts Loader === */
.hearts-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.heart {
  position: relative;
  width: 40px;
  height: 36px;
  background-color: #e91e63;
  transform: rotate(-45deg);
  animation: bump 1.2s infinite ease-in-out;
  margin-left: 20px;
}

.heart::before,
.heart::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 36px;
  background-color: #e91e63;
  border-radius: 50%;
}

.heart::before {
  top: -20px;
  left: 0;
}

.heart::after {
  left: 20px;
  top: 0;
}

@keyframes bump {

  0%,
  100% {
    transform: scale(1) rotate(-45deg);
  }

  25% {
    transform: scale(1.2) rotate(-45deg);
  }

  50% {
    transform: scale(1.05) rotate(-45deg);
  }

  75% {
    transform: scale(1.2) rotate(-45deg);
  }
}
</style>
