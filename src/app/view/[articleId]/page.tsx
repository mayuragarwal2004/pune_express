"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head"; // Import Head from next/head
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import "../../../../assets/css/SpecificArticleDesign1.scss";
// import "../../../../assets/css/Home.scss";
import { formatDate } from "@/app/utilfunctions/dateFormatter";
import LeftAsideNews from "@/app/components/LeftAsideNews";
import Link from "next/link";
import { news } from "@/app/utilfunctions/interfaces";
import RightBsideNews from "@/app/components/RightBsideNews";
import { Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";

function getRandomElement(array: news[]) {
  const randomIndex = Math.floor(Math.random() * array.length);
  const randomElement = array[randomIndex];
  return randomElement;
}

const ArticlePage = ({ params }: { params: { articleId: string } }) => {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendingNews, setTrendingNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [marketTickerData, setMarketTickerData] = useState(<></>);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchTrendingNewsArticle = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?num=15&randomize=false&sortBy=created_datetime&order=DESC`
        );
        let data = await response.json();
        if (response.ok) {
          const randomElement = getRandomElement(data.slice(1) || data);
          setMarketTickerData(
            <>
              <Link href={`/view/${randomElement.articleId}`}>
                Breaking News: {randomElement.title}
              </Link>
            </>
          );
          data = data.slice(0, 10);
          setTrendingNews(data);
          // Store category in localStorage
          if (data.type) {
            localStorage.setItem("articleType", data.type);
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    const fetchLatestNewsArticle = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?articleType=random&num=8&order=DESC`
        );
        const data = await response.json();
        if (response.ok) {
          setLatestNews(data);
          // Store category in localStorage
          if (data.type) {
            localStorage.setItem("articleType", data.type);
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    fetchTrendingNewsArticle();
    fetchLatestNewsArticle();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?articleId=${encodeURIComponent(
            params.articleId
          )}&fullDescription=true`
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

  const handleShare = async () => {
    const articleUrl = `${window.location.origin}/view/${params.articleId}`;
    const articleTitle = article?.title || "Check out this article!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: articleTitle,
          text: article.description,
          url: articleUrl,
        });
        console.log("Article shared successfully!");
      } catch (error) {
        console.error("Error sharing article:", error);
      }
    } else {
      // Fallback to copy the link if Web Share API is not available
      navigator.clipboard.writeText(articleUrl).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      });
    }
  };

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
        <div className="leftaside">
          <LeftAsideNews trendingNews={trendingNews} />
        </div>
        <div className="article-dis">
          <div className="image">
            <img src={article.lphoto} alt="Article Image" />
          </div>
          <div className="des">
            <p style={{ textAlign: "justify" }}>{article.description}</p>
          </div>

          {/* Share Button */}
          <div className="share-button">
            <Tooltip title={isCopied ? "Link Copied!" : "Share this article"}>
              <button
                onClick={handleShare}
                className="share-article-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  position: "fixed",
                  right: "50px",
                  top: "100px",
                }}
              >
                <ShareIcon style={{ marginRight: "5px" }} />
                Share
              </button>
            </Tooltip>
          </div>

          {/* {article.lphoto && (
          <div className="image">
            <img src={article.lphoto} alt="Additional Image" />
            <div className="caption">IMAGE CAPTION OR CREDIT</div>
          </div>
        )} */}

          {/* You can add more logic to fetch and display related articles */}
        </div>

        <aside className="right-aside">
          <RightBsideNews latestNews={latestNews} />
        </aside>
      </div>
      {/* 
      <div>
        <hr />
        <h2>Other Trending News</h2>
      </div> */}
    </div>
  );
};

export default ArticlePage;
