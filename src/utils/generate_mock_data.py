import pandas as pd
import numpy as np
from faker import Faker
import os

fake = Faker()


def generate_startups(num_records=1000):
    data = []
    industries = ["Fintech", "Healthtech", "SaaS", "Edtech", "E-commerce", "AI", "Web3"]
    countries = ["USA", "UK", "India", "Canada", "Germany", "France", "Singapore"]

    for _ in range(num_records):
        startup_id = fake.uuid4()
        name = fake.company()
        industry = np.random.choice(industries)
        country = np.random.choice(countries)
        months_active = np.random.randint(12, 120)

        # Funding ranges from $100K to $100M
        total_funding_usd = np.round(np.random.uniform(100000, 100000000), 2)

        # Burn rate proxy logic (e.g. expenses vs time)
        burn_rate_proxy = np.round(
            total_funding_usd / (months_active * np.random.uniform(0.5, 2.0)), 2
        )

        co_investor_count = np.random.randint(1, 20)

        # Target variable: success (1 if IPO or Acquisition, 0 if Failed or Operating)
        success = np.random.choice([0, 1], p=[0.7, 0.3])

        # Inject some anomalies for Isolation Forest to catch
        if np.random.random() < 0.05:  # 5% anomalies
            total_funding_usd *= 100  # absurd funding
            months_active = -5  # absurd time
            co_investor_count = 500

        data.append(
            {
                "startup_id": startup_id,
                "name": name,
                "industry": industry,
                "country": country,
                "months_active": months_active,
                "total_funding_usd": total_funding_usd,
                "burn_rate_proxy": burn_rate_proxy,
                "co_investor_count": co_investor_count,
                "success": success,
            }
        )

    df = pd.DataFrame(data)

    os.makedirs("data/raw", exist_ok=True)
    df.to_csv("data/raw/startups.csv", index=False)
    print(f"Generated {num_records} startup records to data/raw/startups.csv")


if __name__ == "__main__":
    # Set random seed for reproducibility
    np.random.seed(42)
    Faker.seed(42)
    generate_startups(5000)
