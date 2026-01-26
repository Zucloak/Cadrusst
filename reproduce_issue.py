from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for initialization
        time.sleep(2)

        print("Adding Box...")
        page.get_by_label("Toggle Menu").click()
        time.sleep(0.5)
        page.get_by_label("Add Box").click()

        # Wait for box to appear
        time.sleep(1)

        print("Updating placement manually to [5, 0, 0]...")
        page.evaluate("""
            const store = window.useCADStore;
            // Assuming ID is 1
            store.getState().updatePlacement(1, [5, 0, 0], [0, 0, 0, 1]);
        """)

        time.sleep(1)

        # Verify object position from store
        pos = page.evaluate("""
            window.useCADStore.getState().objects.find(o => o.id === 1).position
        """)
        print(f"Store position after update: {pos}")

        time.sleep(1)

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/reproduce_manual.png")

        browser.close()

if __name__ == "__main__":
    run()
