"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import styles from "./AdminPage.module.css";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: "the-bombay-forum.firebaseapp.com",
  projectId: "the-bombay-forum",
  storageBucket: "the-bombay-forum.appspot.com",
  messagingSenderId: "3452039032",
  appId: "1:3452039032:web:d9d74dadd9718340eee28d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

interface FormData {
  articleId: string;
  title: string;
  description: string;
  sphoto: string;
  lphoto: string;
  type: string;
  source: string;
  sourceLink: string;
  link: string;
}

interface Article {
  id: number;
  articleId: string;
  title: string;
  description: string;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    articleId: "",
    title: "",
    description: "",
    sphoto: "",
    lphoto: "",
    type: "",
    source: "",
    sourceLink: "",
    link: "",
  });

  const [sPhotoFile, setSPhotoFile] = useState<File | null>(null);
  const [lPhotoFile, setLPhotoFile] = useState<File | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    console.log("Articles: ", articles);
  }, [articles]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    photoType: "sphoto" | "lphoto"
  ) => {
    const file = e.target.files?.[0] || null;
    if (photoType === "sphoto") setSPhotoFile(file);
    else setLPhotoFile(file);
  };

  const uploadImage = async (file: File, filePath: string): Promise<string> => {
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let sPhotoURL = formData.sphoto;
      let lPhotoURL = formData.lphoto;

      if (sPhotoFile) {
        sPhotoURL = await uploadImage(
          sPhotoFile,
          `images/sphoto_${Date.now()}`
        );
      }

      if (lPhotoFile) {
        lPhotoURL = await uploadImage(
          lPhotoFile,
          `images/lphoto_${Date.now()}`
        );
      }

      const newFormData = {
        ...formData,
        sphoto: sPhotoURL,
        lphoto: lPhotoURL,
      };

      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFormData),
      });

      console.log("form Data: ", newFormData);

      if (res.ok) {
        alert("News added successfully!");
        setFormData({
          articleId: "",
          title: "",
          description: "",
          sphoto: "",
          lphoto: "",
          type: "",
          source: "",
          sourceLink: "",
          link: "",
        });
        setSPhotoFile(null);
        setLPhotoFile(null);
        const newArticle = await res.json();
        setArticles((prevArticles) => [...prevArticles, newArticle]);
      } else {
        alert("Error adding news.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Check if user is an admin
  if (!session || session.user?.role !== "admin") {
    router.push("/");
    return null;
  }

  return (
    <>
      <div className={styles.container} style={{ marginTop: "90px" }}>
      <h1 className={styles.heading}>Add News</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Form fields */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          onChange={handleChange}
          className={styles.input}
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className={styles.textarea}
        />

        {/* Small Photo Upload */}
        <input
          type="file"
          name="sphoto"
          onChange={(e) => handleFileChange(e, "sphoto")}
          className={styles.input}
        />

        {/* Large Photo Upload */}
        <input
          type="file"
          name="lphoto"
          onChange={(e) => handleFileChange(e, "lphoto")}
          className={styles.input}
        />

        {/* Dropdown for type */}
        <select
          name="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className={styles.input}
        >
          <option value="">Select Type</option>
          <option value="pune">Pune</option>
        </select>

        <input
          type="text"
          name="source"
          placeholder="Source"
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="sourceLink"
          placeholder="Source Link"
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="link"
          placeholder="Link"
          onChange={handleChange}
          className={styles.input}
        />

        <button type="submit" className={styles.button}>
          Add News
        </button>
      </form>
    </div>
    </>
  );
}
