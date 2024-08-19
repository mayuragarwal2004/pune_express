import sqlite3
from playwright.sync_api import sync_playwright

class ArticleScraper:
    # def _init_(self, db_name='articles.db'):
        # Connect to SQLite database file
        # self.connection = sqlite3.connect(db_name)
        # self.cursor = self.connection.cursor()
        # self.create_table()

    def create_table(self):
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                header TEXT,
                content TEXT,
                image_url TEXT
            )
        ''')
        self.connection.commit()

    def fetch_articles(self, url):
        with sync_playwright() as p:
          
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=120000)

            # Fetch the headers, contents, and images
            headers = page.query_selector_all('h3')  
            contents = page.query_selector_all('.content') 
            images = page.query_selector_all('img')  
            print("check1")
            print(headers)
            print(len(contents))
            print(len(images))
            
            for header, content, image in zip(headers, contents, images):
                print("check")
                
                # Extract text content and image URL
                header_text = header.text_content().strip() if header else None
                content_text = content.text_content().strip() if content else None
                image_url = image.get_attribute('src') if image else None
                print({'header': header_text, 'content': content_text, 'image_url': image_url})
                # self.save_article(header_text, content_text, image_url)
            print("check10")

            browser.close()

    def save_article(self, header, content, image_url):
        # Insert article data into SQLite database
        self.cursor.execute('''
            INSERT INTO articles (header, content, image_url)
            VALUES (?, ?, ?)
        ''', (header, content, image_url))
        self.connection.commit()

    def close(self):
        return
        self.connection.close()


scraper = ArticleScraper()
url = "https://www.mid-day.com/mumbai/"  
scraper.fetch_articles(url)
scraper.close()