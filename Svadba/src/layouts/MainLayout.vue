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

        <!-- Upload Instructions -->
        <q-card flat bordered class="upload-card q-mt-xl q-pa-md">
          <q-card-section>
            <div class="text-center">
              <q-icon name="photo_camera" size="40px" class="text-pink-6" />
              <h2 class="text-h6 text-bold q-mt-sm">Share Your Photos</h2>
              <p class="text-body2 text-grey-7 q-mt-xs">
                Upload the moments you captured so we can keep this day alive forever 💖
              </p>
            </div>
          </q-card-section>

          <q-separator spaced />

          <q-card-section>
            <q-uploader ref="uploader" label="Tap to select wedding photos" accept="image/*" :auto-upload="false"
              @added="generatePresignedUrls" color="pink-6" text-color="white" flat bordered class="wedding-uploader" />
          </q-card-section>
        </q-card>

        <!-- Success Dialog -->
        <q-dialog v-model="successDialog">
          <q-card class="q-pa-md text-center">
            <q-card-section>
              <q-icon name="check_circle" size="48px" class="text-green-6 q-mb-sm" />
              <div class="text-h6 text-bold">Upload Successful 🎉</div>
              <p class="text-body2 text-grey-8 q-mt-xs">
                Thank you for sharing your photo with Valentina & Berk’s album!
              </p>
            </q-card-section>
            <q-card-actions align="center">
              <q-btn flat color="pink-6" label="Close" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

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
import { useQuasar } from "quasar";

const $q = useQuasar();
const successDialog = ref(false);
const uploaderRef = ref(null);

async function generatePresignedUrls(files) {
  if (!files.length) return;

  try {
    // 1️⃣ Collect file names to send to backend
    const fileNames = files.map(f => f.name);

    // 2️⃣ Request presigned URLs from Flask backend
    const res = await fetch("https://mjvwsyxyzc.execute-api.eu-north-1.amazonaws.com/default/svadbaLambdaFunction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filenames: fileNames, content_type: files[0].type })
    });

    if (!res.ok) throw new Error("Failed to get presigned URLs");
    const data = await res.json();

    // 3️⃣ Upload each file to S3
    await Promise.all(
      files.map(async (file, idx) => {
        const presignedUrl = data.urls[idx]?.upload_url;
        if (!presignedUrl) throw new Error(`No presigned URL for ${file.name}`);

        await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,                // must match signed ContentType
            "x-amz-server-side-encryption": "AES256"  // must match signed header
          },
          body: file
        });

        $q.notify({ type: "positive", message: `${file.name} uploaded successfully!` });
      })
    );

    // 4️⃣ Show success dialog after all uploads
    successDialog.value = true;
    uploaderRef.value.reset();

  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Upload failed. Please try again." });
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
  /* gold tone */
}

.upload-card {
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.08);
}

.wedding-uploader {
  border-radius: 12px;
}

.text-gold {
  color: #c9a43f;
}
</style>
