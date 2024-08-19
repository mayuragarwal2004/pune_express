import requests
from bs4 import BeautifulSoup
import pymysql
import hashlib
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

class ScraperNDTVpune:
    def __init__(self):
        self.url = "https://www.ndtv.com/pune-news"
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
        }
        
        self.db_config = {
            'host': os.getenv('MYSQL_HOST'),
            'port': int(os.getenv('MYSQL_PORT')),
            'user': os.getenv('MYSQL_USER'),
            'password': os.getenv('MYSQL_PASSWORD'),
            'database': os.getenv('MYSQL_DATABASE')
        }

    def generate_article_id(self, title: str) -> str:
        """Generate a unique ArticleId based on the article title."""
        title_slug = ''.join(c if c.isalnum() else '-' for c in title.lower())
        if len(title_slug) > 240:
            title_slug = title_slug[:240]
        print(len(title_slug))
        suffix = hashlib.md5(title.encode()).hexdigest()[:7]
        return f"{title_slug}-{suffix}"

    def fetch(self):
        articles = []
        r = requests.get(self.url, headers=self.headers)
        soup = BeautifulSoup(r.text, 'html.parser')

        # Find all elements with class "news_Itm"
        elements = soup.find_all('div', class_='news_Itm')

        # Iterate over each news item
        for element in elements:
            news_data = {}

            # Attempt to find the 'news_Itm-img' div
            news_itm_img = element.find('div', class_='news_Itm-img')

            if news_itm_img:
                # Attempt to find the 'a' tag
                link = news_itm_img.find('a')
                if link:
                    link1 = link.get('href')
                    news_data['link'] = link1

                    # Fetch the article and extract paragraphs
                    article_response = requests.get(link1, headers=self.headers)
                    article_soup = BeautifulSoup(article_response.text, 'html.parser')
                    article = article_soup.find('div', id='ins_storybody')
                    if article:
                        paragraphs = article.find_all('p')
                        news_data['paragraphs'] = [p.text for p in paragraphs]
                    else:
                        news_data['paragraphs'] = "No paragraphs found"
                else:
                    news_data['link'] = "No link found"
                    
                article_text = ""
                for p in paragraphs:
                    article_text += p.get_text() + "\n"
                article_text = article_text.strip()
                news_data['article_text'] = article_text

                # Attempt to find the 'img' tag
                img_tag = news_itm_img.find('img')
                if img_tag:
                    img_src = img_tag.get('src')
                    img_alt = img_tag.get('alt')
                    news_data['img_src'] = img_src
                    news_data['img_alt'] = img_alt
                else:
                    continue
                    news_data['img_src'] = "No image found"
                    news_data['img_alt'] = "No alt text"
            else:
                continue
                news_data['link'] = "No link found"
                news_data['img_src'] = "No image found"
                news_data['img_alt'] = "No alt text"
                news_data['paragraphs'] = "No paragraphs found"

            # Append the news data to the articles array
            articles.append(news_data)
        
        return articles

    def insert_data(self, headings, Desc_list, smallimg, bigimg, articleURL):
        connection = pymysql.connect(**self.db_config, cursorclass=pymysql.cursors.DictCursor)
        try:
            with connection.cursor() as cursor:
                try:
                    article_id = self.generate_article_id(headings)
                    check_query = "SELECT COUNT(*) FROM news WHERE ArticleId = %s"
                    cursor.execute(check_query, (article_id,))
                    exists = cursor.fetchone()['COUNT(*)']

                    if exists == 0:
                        insert_query = """
                            INSERT INTO news (ArticleId, Title, Description, Sphoto, Lphoto, Type,  Source, SourceLink, Link)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        values = (article_id, headings, Desc_list, smallimg, bigimg, 'Pune', "NDTV", "https://www.ndtvprofit.com/technology", articleURL)
                        cursor.execute(insert_query, values)
                    else:
                        print(f"Article with ArticleId {article_id} already exists, skipping.")
                except Exception as e:
                    print(f"Error executing query: {str(e)}")
                    connection.rollback()
                connection.commit()
                print("Data inserted successfully")
        except Exception as e:
            print(f"Error with database operations: {str(e)}")
            connection.rollback()
        finally:
            connection.close()

    def run(self):
        articles = self.fetch()
        
        # print articles in json format
        print(json.dumps(articles, indent=4))
        
        for article in articles:
            self.insert_data(article['img_alt'],article['article_text'],article['img_src'],article['img_src'],article['link'])

if __name__ == "__main__":
    scraper = ScraperNDTVpune()
    scraper.run()