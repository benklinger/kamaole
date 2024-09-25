# Kama Ole? (How Much Does It Cost?)

**Kama Ole?** is an interactive web-based game designed to challenge players' knowledge of product and meal prices. The game fetches data from a JSON file, presents players with either a product or a meal, and prompts them to guess its price. After making a guess, players receive feedback on the accuracy of their estimation and have the option to play previous or current games.

## ✨ Features

- **Dynamic Data Fetching:** Retrieves product and meal data from a `data.json` file, ensuring up-to-date information.
- **Interactive Gameplay:** Players guess the prices of products or meals using a responsive slider.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices using CSS media queries.
- **User Feedback:** Provides immediate feedback on guesses, indicating whether they are too high, too low, or correct.
- **Replay Options:** Offers options to replay previous games or try new ones based on different products or meals.
- **Animated Transitions:** Smooth fade-in and fade-out animations enhance the user experience.
- **Localized Content:** Supports Hebrew language and right-to-left (RTL) layout for seamless user interaction.

## 🎮 Demo

Experience the game live by visiting our [GitHub Pages](https://benklinger.github.io/kamaole)

## 🛠️ Usage

Follow these steps to play **כמה עולה?**:

1. **Start the Game:**

   - **Open the Game:**
     - Locate the `index.html` file in the project directory.
     - Double-click to open it in your default web browser.

   - **Select Your Challenge:**
     - You'll be presented with two daily options:
       - **Product**
       - **Meal**
     - Click on the desired option to begin.

2. **Make a Guess:**

   - **Adjust the Slider:**
     - Use the slider to set your guessed price for the selected product or meal.
     - The slider allows you to choose a price within the predefined range.

   - **Confirm Your Guess:**
     - Once satisfied with your guess, click the **Confirm** button.
     - This action will submit your guess and navigate you to the results page.

3. **View Results:**

   - **Actual Price Display:**
     - On the `end.html` page, you'll see the actual price of the selected product or meal.
     - Prices are displayed in shekels and agorot (e.g., ₪5<span class="agorot">90</span>).

   - **Feedback on Your Guess:**
     - The page will indicate whether your guess was too high, low or correct.
     - The difference between your guess and the actual price is also displayed.

4. **Replay or Play Previous Games:**

   - **Second Option Availability:**
     - Depending on your initial selection:
       - If you guessed a **product**, you'll have the option to play yesterday's **product** and today's **meal**.
       - If you guessed a **meal**, you'll have the option to play yesterday's **meal** and today's **product**.

   - **Select an Option:**
     - Click on the desired option to start a new round with the corresponding product or meal.
     - This allows you to test your knowledge across different items and dates.

5. **Navigate Through Options:**

   - **Interactive Elements:**
     - If playing a meal, you can navigate through different products included in the meal by clicking on the image or the navigation dots.
     - Each click cycles through the available products, updating the display accordingly.

6. **Responsive Design:**

   - **Optimized for All Devices:**
     - The game is designed to be fully responsive.
     - Whether you're on a desktop, tablet, or mobile device, the layout and functionality adapt to provide an optimal experience.

7. **Additional Features:**

   - **Animated Price Changes:**
     - When adjusting the slider, price changes are animated for a smooth visual experience.
   
   - **Localized Content:**
     - All text and layout are optimized for Hebrew language and right-to-left (RTL) orientation.

---

**Enjoy testing your knowledge with כמה עולה?!** If you encounter any issues or have suggestions for improvements, feel free to contribute or reach out through the [Contact](#contact) section of this README.

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
*Feel free to use and modify this project as per the license terms.*

### **MIT License**

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in  
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
THE SOFTWARE.

## 📫 Contact

For any inquiries, feedback, or contributions, please reach out to me:

- **Email:** [benklinger@gmail.com](mailto:benklinger@gmail.com)

Feel free to open an issue or submit a pull request if you have suggestions or improvements!

