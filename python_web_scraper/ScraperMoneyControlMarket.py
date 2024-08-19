from math import e
from bs4 import BeautifulSoup
import requests
import pymysql
import hashlib
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ScraperMoneyControlMarket:
    def __init__(self):
        self.url = "https://www.moneycontrol.com/stocksmarketsindia/"
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

    def fetch_data(self):
        try:
            r = requests.get(self.url, headers=self.headers)
            soup = BeautifulSoup(r.text, 'html.parser')

            # Initialize the list to store scraped data
            scraped_data = []

            # Find the div element with class "market_tpnews"
            market_tpnews_div = soup.find_all('div', class_='market_tpnews')

            for div in market_tpnews_div:
                # Initialize dictionary for each article
                article_data = {
                    'image_alt_text': "No image alt text found",
                    'image_url': None,
                    'article_href': "No second link found",
                    'headings': "",
                    'article_text': "No second link text found"
                }

                # Find the first a tag with an img tag inside and get the image alt text
                first_a_tag = div.find('a', href=True)
                if first_a_tag and first_a_tag.find('img', alt=True):
                    image_alt1 = div.find('img', alt=True)
                    article_data['image_alt_text'] = first_a_tag.find('img')['alt']
                    article_data['image_url'] = image_alt1['src']
                
                a_tags = div.find_all('a')
                if len(a_tags) > 1:
                    article_href = a_tags[1]['href']
                    article_href = article_href[45:len(article_href)]
                    if article_href.startswith('/'):
                        article_href = f"https://www.moneycontrol.com{article_href}"
                    article_data['article_href'] = article_href

                    article_response = requests.get(article_href, headers=self.headers)
                    article_soup = BeautifulSoup(article_response.text, 'html.parser')

                    content_wrapper_div = article_soup.find('div', class_='page_wrapper') #page_wrapper  
                    hindi_wrapper_div = article_soup.find('div', class_='wrapper consumption-main') 
                    if content_wrapper_div:
                        paragraphs = content_wrapper_div.find_all('p')
                        article_data['article_text'] = ' '.join(p.get_text(strip=True) for p in paragraphs)
                        headings = content_wrapper_div.find_all('h2')
                        article_data['headings'] = ' '.join(h.get_text(strip=True) for h in headings)
                    elif hindi_wrapper_div:
                        paragraphs = hindi_wrapper_div.find_all('p')
                        article_data['article_text'] = ' '.join(p.get_text(strip=True) for p in paragraphs)
                        headings = hindi_wrapper_div.find_all('h2')
                        article_data['headings'] = ' '.join(h.get_text(strip=True) for h in headings)

                # Append the dictionary to the list
                scraped_data.append(article_data)

            # Print the results for each article
            # for data in scraped_data:
            #     print(f"Image Alt Text: {data['image_alt_text']}")
            #     print(f"Image URL: {data['image_url']}")
            #     print(f"Article Href: {data['article_href']}")
            #     print(f"Headings of Article: ")
            #     print(data['headings'])
            #     break
            #     exit()
            #     data['headline'] = ""
            #     for heading in data['headings']:
            #         data['headline'] += heading
            #     print(data['headline'])
            #     print(f"Article Text: ")
            #     data['summary'] = ""
            #     for text in data['article_text']:
            #         data['summary'] += text
            #         print(text)
            #     print('---')
            
            print(scraped_data)
            
            return scraped_data
        except Exception as e:
            print(f"Error fetching data: {str(e)}")
            return [], [], [], []


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
                        values = (article_id, headings, Desc_list, smallimg, bigimg, 'Markets', "NDTV", "https://www.ndtvprofit.com/technology", articleURL)
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
        articles = self.fetch_data()
                
        for article in articles:
            self.insert_data(article['headings'],article['article_text'],article['image_url'],article['image_url'],article['article_href'])

if __name__ == "__main__":
    print("hello")
    scraper = ScraperMoneyControlMarket()
    scraper.run()
