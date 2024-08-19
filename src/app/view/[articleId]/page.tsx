"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head"; // Import Head from next/head
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import "../../../../assets/css/SpecificArticleDesign1.scss";
import { formatDate } from "@/app/utilfunctions/dateFormatter";

const ArticlePage = ({ params }: { params: { articleId: string } }) => {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?articleId=${encodeURIComponent(
            params.articleId
          )}`
        );
        const data = await response.json();
        if (response.ok) {
          setArticle(data[0]);
          // Store category in localStorage
          if (data.type) {
            localStorage.setItem("articleType", data.type);
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.articleId]);

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>Article not found.</p>;

  console.log(article);

  return (
    <div className="specific-article-design1">
      <Head>
        <title>{"Article Page"}</title>
      </Head>
      <div className="header">
        <div className="go-back" onClick={() => router.back()}>
          <ArrowBackIosNewIcon style={{ fontSize: "10px" }} />
        </div>
        <div className="date-title">
          <div className="date">
            {article.date ? formatDate(new Date(article.date)) : "Unknown Date"}
          </div>
          <div className="title">{article.title}</div>
        </div>
      </div>
      <div className="body">
        <div className="image">
          <img src={article.lphoto} alt="Article Image" />
        </div>
        <p style={{ textAlign: "justify" }}>{article.description}</p>
        {/* {article.lphoto && (
          <div className="image">
            <img src={article.lphoto} alt="Additional Image" />
            <div className="caption">IMAGE CAPTION OR CREDIT</div>
          </div>
        )} */}
        <hr />
        <h2>Other Trending News</h2>
        {/* You can add more logic to fetch and display related articles */}
      </div>
    </div>
  );
};

export default ArticlePage;
