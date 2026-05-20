"""
Analyze the Mall_Customers.csv dataset without external dependencies.

The script prints a concise report, writes the full report to a text file,
and exports each customer with a rule-based segment and a simple cluster ID.
"""

from __future__ import annotations

import argparse
import csv
import html
import math
import random
from collections import Counter
from pathlib import Path
from statistics import mean, median


DEFAULT_INPUT = "Mall_Customers.csv"
REPORT_OUTPUT = "mall_customer_analysis_report.txt"
SEGMENT_OUTPUT = "mall_customer_segments.csv"
SVG_OUTPUT = "mall_customer_age_gender_salary.svg"
PDF_OUTPUT = "mall_customer_analysis_report.pdf"

CUSTOMER_ID = "CustomerID"
GENDER_OPTIONS = ("Genre", "Gender")
AGE = "Age"
INCOME = "Annual Income (k$)"
SPENDING = "Spending Score (1-100)"
AGE_GROUPS = ("Under 25", "25-34", "35-44", "45-54", "55+", "Unknown")


def find_column(fieldnames: list[str], options: tuple[str, ...]) -> str:
    """Return the first matching column from a list of possible names."""
    for option in options:
        if option in fieldnames:
            return option
    raise ValueError(f"Could not find any of these columns: {', '.join(options)}")


def to_float(value: str | None) -> float | None:
    if value is None:
        return None
    value = value.strip()
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def load_customers(csv_path: Path) -> tuple[list[dict[str, str]], str]:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    with csv_path.open("r", newline="", encoding="utf-8-sig") as csv_file:
        reader = csv.DictReader(csv_file)
        if not reader.fieldnames:
            raise ValueError("The CSV file has no header row.")

        rows = [
            {key.strip(): (value.strip() if value else "") for key, value in row.items()}
            for row in reader
        ]

    gender_col = find_column(reader.fieldnames, GENDER_OPTIONS)
    return rows, gender_col


def values_for(rows: list[dict[str, str]], column: str) -> list[float]:
    return [
        number
        for row in rows
        if (number := to_float(row.get(column))) is not None
    ]


def percentile(values: list[float], percent: float) -> float:
    sorted_values = sorted(values)
    if not sorted_values:
        return math.nan

    position = (len(sorted_values) - 1) * percent
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return sorted_values[int(position)]

    lower_value = sorted_values[lower]
    upper_value = sorted_values[upper]
    return lower_value + (upper_value - lower_value) * (position - lower)


def numeric_summary(rows: list[dict[str, str]], column: str) -> dict[str, float | int]:
    values = values_for(rows, column)
    missing = len(rows) - len(values)
    if not values:
        return {"count": 0, "missing": missing}

    avg = mean(values)
    variance = sum((value - avg) ** 2 for value in values) / len(values)
    return {
        "count": len(values),
        "missing": missing,
        "min": min(values),
        "q1": percentile(values, 0.25),
        "median": median(values),
        "mean": avg,
        "q3": percentile(values, 0.75),
        "max": max(values),
        "std_dev": math.sqrt(variance),
    }


def format_number(value: float | int) -> str:
    if isinstance(value, int):
        return str(value)
    if math.isnan(value):
        return "n/a"
    return f"{value:.2f}"


def pearson_correlation(rows: list[dict[str, str]], first: str, second: str) -> float | None:
    pairs = []
    for row in rows:
        x_value = to_float(row.get(first))
        y_value = to_float(row.get(second))
        if x_value is not None and y_value is not None:
            pairs.append((x_value, y_value))

    if len(pairs) < 2:
        return None

    xs = [pair[0] for pair in pairs]
    ys = [pair[1] for pair in pairs]
    x_mean = mean(xs)
    y_mean = mean(ys)
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in pairs)
    x_denominator = math.sqrt(sum((x - x_mean) ** 2 for x in xs))
    y_denominator = math.sqrt(sum((y - y_mean) ** 2 for y in ys))

    if x_denominator == 0 or y_denominator == 0:
        return None
    return numerator / (x_denominator * y_denominator)


def age_group(age: float | None) -> str:
    if age is None:
        return "Unknown"
    if age < 25:
        return "Under 25"
    if age <= 34:
        return "25-34"
    if age <= 44:
        return "35-44"
    if age <= 54:
        return "45-54"
    return "55+"


def customer_segment(income: float | None, spending: float | None) -> str:
    if income is None or spending is None:
        return "Incomplete data"
    if income >= 70 and spending >= 60:
        return "Premium targets"
    if income >= 70 and spending < 40:
        return "High income, low spend"
    if income < 40 and spending >= 60:
        return "Budget enthusiasts"
    if income < 40 and spending < 40:
        return "Low activity"
    if spending >= 60:
        return "Active shoppers"
    if spending < 40:
        return "Careful shoppers"
    return "Balanced shoppers"


def standardize(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    x_mean = mean(xs)
    y_mean = mean(ys)
    x_std = math.sqrt(sum((x - x_mean) ** 2 for x in xs) / len(xs)) or 1
    y_std = math.sqrt(sum((y - y_mean) ** 2 for y in ys) / len(ys)) or 1
    return [((x - x_mean) / x_std, (y - y_mean) / y_std) for x, y in points]


def kmeans(points: list[tuple[float, float]], k: int, max_iterations: int = 100) -> list[int]:
    """Small deterministic k-means implementation for income/spending clusters."""
    if not points:
        return []

    k = max(1, min(k, len(points)))
    normalized = standardize(points)
    rng = random.Random(42)
    centers = rng.sample(normalized, k)
    assignments = [0] * len(normalized)

    for _ in range(max_iterations):
        changed = False
        for index, point in enumerate(normalized):
            distances = [
                math.dist(point, center)
                for center in centers
            ]
            new_assignment = distances.index(min(distances))
            if new_assignment != assignments[index]:
                assignments[index] = new_assignment
                changed = True

        new_centers = []
        for cluster_id in range(k):
            cluster_points = [
                point
                for point, assignment in zip(normalized, assignments)
                if assignment == cluster_id
            ]
            if cluster_points:
                new_centers.append(
                    (
                        mean(point[0] for point in cluster_points),
                        mean(point[1] for point in cluster_points),
                    )
                )
            else:
                new_centers.append(rng.choice(normalized))

        centers = new_centers
        if not changed:
            break

    return assignments


def cluster_assignments_by_index(rows: list[dict[str, str]], k: int) -> dict[int, int]:
    valid_points = []
    valid_indexes = []
    for index, row in enumerate(rows):
        income = to_float(row.get(INCOME))
        spending = to_float(row.get(SPENDING))
        if income is not None and spending is not None:
            valid_indexes.append(index)
            valid_points.append((income, spending))

    assignments = kmeans(valid_points, k)
    return {
        row_index: cluster_id + 1
        for row_index, cluster_id in zip(valid_indexes, assignments)
    }


def make_bar(label: str, count: int, total: int, width: int = 32) -> str:
    filled = round((count / total) * width) if total else 0
    bar = "#" * filled + "." * (width - filled)
    percent = (count / total * 100) if total else 0
    return f"{label:<24} {count:>4} ({percent:>5.1f}%) |{bar}|"


def normalized_gender(value: str | None) -> str:
    text = (value or "Unknown").strip()
    if text.lower() == "female":
        return "Female"
    if text.lower() == "male":
        return "Male"
    return text or "Unknown"


def gender_colors(gender: str) -> tuple[str, str]:
    if gender == "Female":
        return "#d84f67", "#8a263a"
    if gender == "Male":
        return "#177e89", "#084c55"
    return "#68707a", "#343a40"


def gender_sort_key(gender: str) -> tuple[int, str]:
    order = {"Female": 0, "Male": 1, "Unknown": 99}
    return order.get(gender, 50), gender


def nice_axis(values: list[float], target_ticks: int = 6, include_zero: bool = False) -> tuple[float, float, list[float]]:
    if not values:
        return 0, 1, [0, 1]

    axis_min = min(values)
    axis_max = max(values)
    if include_zero:
        axis_min = min(0, axis_min)
        axis_max = max(0, axis_max)

    if axis_min == axis_max:
        axis_min -= 1
        axis_max += 1

    raw_step = (axis_max - axis_min) / target_ticks
    magnitude = 10 ** math.floor(math.log10(raw_step))
    step = magnitude
    for multiplier in (1, 2, 5, 10):
        candidate = magnitude * multiplier
        if raw_step <= candidate:
            step = candidate
            break

    lower = math.floor(axis_min / step) * step
    upper = math.ceil(axis_max / step) * step
    ticks = []
    current = lower
    while current <= upper + (step * 0.5):
        ticks.append(round(current, 10))
        current += step

    return lower, upper, ticks


def svg_marker(x: float, y: float, gender: str, title: str) -> str:
    fill, stroke = gender_colors(gender)
    title_tag = f"<title>{html.escape(title)}</title>"
    if gender == "Male":
        return (
            f'<rect x="{x - 3.7:.2f}" y="{y - 3.7:.2f}" width="7.4" height="7.4" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="1" opacity="0.82">'
            f"{title_tag}</rect>"
        )
    if gender == "Female":
        return (
            f'<circle cx="{x:.2f}" cy="{y:.2f}" r="4.1" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="1" opacity="0.82">'
            f"{title_tag}</circle>"
        )

    points = f"{x:.2f},{y - 4:.2f} {x + 4:.2f},{y + 4:.2f} {x - 4:.2f},{y + 4:.2f}"
    return (
        f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" '
        f'stroke-width="1" opacity="0.82">{title_tag}</polygon>'
    )


def write_age_gender_salary_svg(rows: list[dict[str, str]], gender_col: str, output_path: Path) -> None:
    records = []
    for index, row in enumerate(rows):
        age = to_float(row.get(AGE))
        income = to_float(row.get(INCOME))
        if age is None or income is None:
            continue
        records.append(
            {
                "index": index,
                "customer_id": row.get(CUSTOMER_ID, ""),
                "gender": normalized_gender(row.get(gender_col)),
                "age": age,
                "income": income,
            }
        )

    if not records:
        output_path.write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300">'
            '<text x="40" y="80" font-family="Arial" font-size="22">'
            "No age and salary data available."
            "</text></svg>\n",
            encoding="utf-8",
        )
        return

    width = 1120
    height = 740
    plot_x = 90
    plot_y = 125
    plot_w = 650
    plot_h = 450
    bar_x = 805
    bar_y = 170
    bar_w = 245
    bar_h = 315

    ages = [record["age"] for record in records]
    incomes = [record["income"] for record in records]
    x_min, x_max, x_ticks = nice_axis(ages, target_ticks=6)
    y_min, y_max, y_ticks = nice_axis(incomes, target_ticks=6, include_zero=True)

    def x_scale(value: float) -> float:
        return plot_x + ((value - x_min) / (x_max - x_min)) * plot_w

    def y_scale(value: float) -> float:
        return plot_y + plot_h - ((value - y_min) / (y_max - y_min)) * plot_h

    genders = sorted({record["gender"] for record in records}, key=gender_sort_key)
    grouped_income: dict[tuple[str, str], list[float]] = {}
    for record in records:
        group = age_group(record["age"])
        key = (group, record["gender"])
        grouped_income.setdefault(key, []).append(record["income"])

    averages = {
        key: mean(values)
        for key, values in grouped_income.items()
        if values
    }
    average_values = list(averages.values()) or [0]
    avg_min, avg_max, avg_ticks = nice_axis(average_values, target_ticks=4, include_zero=True)

    def avg_scale(value: float) -> float:
        return bar_x + ((value - avg_min) / (avg_max - avg_min)) * bar_w

    elements = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">',
        "<title>Mall customers by age, gender, and salary</title>",
        "<style>",
        "text { font-family: 'Segoe UI', Arial, sans-serif; fill: #1d252c; }",
        ".small { font-size: 13px; fill: #4c5963; }",
        ".axis { stroke: #2d343a; stroke-width: 1.2; }",
        ".grid { stroke: #d8d2c7; stroke-width: 1; }",
        ".panel-title { font-size: 18px; font-weight: 700; }",
        "</style>",
        '<rect width="100%" height="100%" fill="#fbfaf6"/>',
        '<rect x="28" y="28" width="1064" height="684" rx="18" fill="#ffffff" stroke="#d9d2c5"/>',
        '<text x="56" y="70" font-size="28" font-weight="700">Age, Gender, and Salary Analysis</text>',
        '<text x="56" y="96" class="small">Salary is shown as annual income in thousands of dollars (k$).</text>',
        f'<text x="{plot_x}" y="{plot_y - 32}" class="panel-title">Each Customer: Age vs Salary</text>',
    ]

    for tick in y_ticks:
        y = y_scale(tick)
        elements.append(f'<line x1="{plot_x}" y1="{y:.2f}" x2="{plot_x + plot_w}" y2="{y:.2f}" class="grid"/>')
        elements.append(f'<text x="{plot_x - 14}" y="{y + 4:.2f}" text-anchor="end" class="small">{tick:g}</text>')

    for tick in x_ticks:
        x = x_scale(tick)
        elements.append(f'<line x1="{x:.2f}" y1="{plot_y}" x2="{x:.2f}" y2="{plot_y + plot_h}" class="grid"/>')
        elements.append(f'<text x="{x:.2f}" y="{plot_y + plot_h + 24}" text-anchor="middle" class="small">{tick:g}</text>')

    elements.extend(
        [
            f'<line x1="{plot_x}" y1="{plot_y + plot_h}" x2="{plot_x + plot_w}" y2="{plot_y + plot_h}" class="axis"/>',
            f'<line x1="{plot_x}" y1="{plot_y}" x2="{plot_x}" y2="{plot_y + plot_h}" class="axis"/>',
            f'<text x="{plot_x + plot_w / 2:.2f}" y="{plot_y + plot_h + 58}" text-anchor="middle" font-size="15" font-weight="600">Age</text>',
            f'<text transform="translate(30 {plot_y + plot_h / 2:.2f}) rotate(-90)" text-anchor="middle" font-size="15" font-weight="600">Annual income / salary (k$)</text>',
        ]
    )

    for record in records:
        jitter = ((record["index"] % 7) - 3) * 0.8
        x = x_scale(record["age"]) + jitter
        y = y_scale(record["income"]) - jitter
        title = (
            f"Customer {record['customer_id']}: {record['gender']}, "
            f"age {record['age']:g}, salary {record['income']:g}k"
        )
        elements.append(svg_marker(x, y, record["gender"], title))

    legend_x = plot_x + plot_w - 170
    legend_y = plot_y + 18
    elements.append(f'<rect x="{legend_x - 16}" y="{legend_y - 22}" width="160" height="{28 + len(genders) * 26}" rx="8" fill="#fffdf8" stroke="#d9d2c5"/>')
    elements.append(f'<text x="{legend_x}" y="{legend_y}" font-size="14" font-weight="700">Gender</text>')
    for offset, gender in enumerate(genders, start=1):
        marker_y = legend_y + offset * 25
        elements.append(svg_marker(legend_x + 8, marker_y - 4, gender, gender))
        elements.append(f'<text x="{legend_x + 24}" y="{marker_y}" class="small">{html.escape(gender)}</text>')

    elements.append(f'<text x="{bar_x - 25}" y="{bar_y - 50}" class="panel-title">Average Salary</text>')
    elements.append(f'<text x="{bar_x - 25}" y="{bar_y - 28}" class="small">Grouped by age band and gender</text>')

    for tick in avg_ticks:
        x = avg_scale(tick)
        elements.append(f'<line x1="{x:.2f}" y1="{bar_y}" x2="{x:.2f}" y2="{bar_y + bar_h}" class="grid"/>')
        elements.append(f'<text x="{x:.2f}" y="{bar_y + bar_h + 22}" text-anchor="middle" class="small">{tick:g}</text>')

    elements.append(f'<line x1="{bar_x}" y1="{bar_y + bar_h}" x2="{bar_x + bar_w}" y2="{bar_y + bar_h}" class="axis"/>')
    elements.append(f'<text x="{bar_x + bar_w / 2:.2f}" y="{bar_y + bar_h + 52}" text-anchor="middle" font-size="14" font-weight="600">Average salary (k$)</text>')

    visible_groups = [group for group in AGE_GROUPS if any((group, gender) in averages for gender in genders)]
    row_gap = bar_h / max(len(visible_groups), 1)
    bar_height = min(13, max(8, (row_gap - 12) / max(len(genders), 1)))
    for group_index, group in enumerate(visible_groups):
        row_top = bar_y + group_index * row_gap + 12
        elements.append(f'<text x="{bar_x - 14}" y="{row_top + 9:.2f}" text-anchor="end" class="small">{html.escape(group)}</text>')
        for gender_index, gender in enumerate(genders):
            average = averages.get((group, gender))
            if average is None:
                continue
            fill, stroke = gender_colors(gender)
            y = row_top + gender_index * (bar_height + 4)
            bar_length = max(0, avg_scale(average) - bar_x)
            elements.append(
                f'<rect x="{bar_x}" y="{y:.2f}" width="{bar_length:.2f}" height="{bar_height:.2f}" '
                f'rx="3" fill="{fill}" stroke="{stroke}" opacity="0.82">'
                f'<title>{html.escape(group)} {html.escape(gender)} average salary: {average:.1f}k</title></rect>'
            )
            elements.append(f'<text x="{bar_x + bar_length + 5:.2f}" y="{y + bar_height - 2:.2f}" class="small">{average:.1f}</text>')

    note_y = 660
    elements.append(f'<text x="56" y="{note_y}" class="small">Tip: open this SVG in a browser and hover over points or bars to see customer and average details.</text>')
    elements.append("</svg>")

    output_path.write_text("\n".join(elements) + "\n", encoding="utf-8")


PDF_PAGE_WIDTH = 595.28
PDF_PAGE_HEIGHT = 841.89


def pdf_escape(value: object) -> str:
    text = str(value).encode("latin-1", "replace").decode("latin-1")
    return (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\r", " ")
        .replace("\n", " ")
    )


def hex_to_rgb(color: str) -> tuple[float, float, float]:
    color = color.strip().lstrip("#")
    return (
        int(color[0:2], 16) / 255,
        int(color[2:4], 16) / 255,
        int(color[4:6], 16) / 255,
    )


def color_operator(color: str, operator: str) -> str:
    red, green, blue = hex_to_rgb(color)
    return f"{red:.3f} {green:.3f} {blue:.3f} {operator}"


def estimate_text_width(text: object, size: float, font: str = "F1") -> float:
    factor = 0.54
    if font == "F2":
        factor = 0.57
    if font == "F3":
        factor = 0.50
    return len(str(text)) * size * factor


def fit_text(text: object, max_width: float, size: float, font: str = "F1") -> str:
    text = str(text)
    if estimate_text_width(text, size, font) <= max_width:
        return text

    while text and estimate_text_width(text + "...", size, font) > max_width:
        text = text[:-1]
    return text + "..." if text else "..."


class PDFCanvas:
    def __init__(self, width: float = PDF_PAGE_WIDTH, height: float = PDF_PAGE_HEIGHT) -> None:
        self.width = width
        self.height = height
        self.operations: list[str] = []

    def text(
        self,
        x: float,
        y: float,
        text: object,
        size: float = 10,
        font: str = "F1",
        fill: str = "#1d252c",
        align: str = "left",
    ) -> None:
        if align == "center":
            x -= estimate_text_width(text, size, font) / 2
        elif align == "right":
            x -= estimate_text_width(text, size, font)

        self.operations.append(
            "q "
            f"{color_operator(fill, 'rg')} "
            f"BT /{font} {size:.2f} Tf 1 0 0 1 {x:.2f} {y:.2f} Tm "
            f"({pdf_escape(text)}) Tj ET Q"
        )

    def line(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        stroke: str = "#2d343a",
        stroke_width: float = 1,
    ) -> None:
        self.operations.append(
            "q "
            f"{color_operator(stroke, 'RG')} {stroke_width:.2f} w "
            f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S Q"
        )

    def rect(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        fill: str | None = None,
        stroke: str | None = None,
        stroke_width: float = 1,
    ) -> None:
        commands = ["q"]
        if fill:
            commands.append(color_operator(fill, "rg"))
        if stroke:
            commands.append(color_operator(stroke, "RG"))
            commands.append(f"{stroke_width:.2f} w")

        mode = "B" if fill and stroke else "f" if fill else "S"
        commands.append(f"{x:.2f} {y:.2f} {width:.2f} {height:.2f} re {mode}")
        commands.append("Q")
        self.operations.append(" ".join(commands))

    def circle(
        self,
        x: float,
        y: float,
        radius: float,
        fill: str | None = None,
        stroke: str | None = None,
        stroke_width: float = 1,
    ) -> None:
        kappa = 0.5522847498
        control = radius * kappa
        commands = ["q"]
        if fill:
            commands.append(color_operator(fill, "rg"))
        if stroke:
            commands.append(color_operator(stroke, "RG"))
            commands.append(f"{stroke_width:.2f} w")

        commands.extend(
            [
                f"{x + radius:.2f} {y:.2f} m",
                f"{x + radius:.2f} {y + control:.2f} {x + control:.2f} {y + radius:.2f} {x:.2f} {y + radius:.2f} c",
                f"{x - control:.2f} {y + radius:.2f} {x - radius:.2f} {y + control:.2f} {x - radius:.2f} {y:.2f} c",
                f"{x - radius:.2f} {y - control:.2f} {x - control:.2f} {y - radius:.2f} {x:.2f} {y - radius:.2f} c",
                f"{x + control:.2f} {y - radius:.2f} {x + radius:.2f} {y - control:.2f} {x + radius:.2f} {y:.2f} c",
            ]
        )
        commands.append("B" if fill and stroke else "f" if fill else "S")
        commands.append("Q")
        self.operations.append(" ".join(commands))

    def content_bytes(self) -> bytes:
        return ("\n".join(self.operations) + "\n").encode("latin-1", "replace")


class SimplePDF:
    def __init__(self) -> None:
        self.pages: list[PDFCanvas] = []

    def add_page(self, width: float = PDF_PAGE_WIDTH, height: float = PDF_PAGE_HEIGHT) -> PDFCanvas:
        page = PDFCanvas(width, height)
        self.pages.append(page)
        return page

    def save(self, output_path: Path) -> None:
        objects: dict[int, bytes] = {}
        catalog_id = 1
        pages_id = 2
        font_regular_id = 3
        font_bold_id = 4
        font_mono_id = 5
        first_page_id = 6

        page_ids = [first_page_id + index * 2 for index in range(len(self.pages))]
        content_ids = [page_id + 1 for page_id in page_ids]

        objects[catalog_id] = b"<< /Type /Catalog /Pages 2 0 R >>"
        objects[pages_id] = (
            b"<< /Type /Pages /Kids ["
            + b" ".join(f"{page_id} 0 R".encode("ascii") for page_id in page_ids)
            + f"] /Count {len(page_ids)} >>".encode("ascii")
        )
        objects[font_regular_id] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        objects[font_bold_id] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
        objects[font_mono_id] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>"

        resource_text = (
            "<< /Font << "
            "/F1 3 0 R "
            "/F2 4 0 R "
            "/F3 5 0 R "
            ">> >>"
        )
        for page, page_id, content_id in zip(self.pages, page_ids, content_ids):
            stream = page.content_bytes()
            objects[page_id] = (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page.width:.2f} {page.height:.2f}] "
                f"/Resources {resource_text} /Contents {content_id} 0 R >>"
            ).encode("ascii")
            objects[content_id] = (
                f"<< /Length {len(stream)} >>\nstream\n".encode("ascii")
                + stream
                + b"endstream"
            )

        highest_id = max(objects)
        pdf = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
        offsets = [0] * (highest_id + 1)
        for object_id in range(1, highest_id + 1):
            offsets[object_id] = len(pdf)
            pdf += f"{object_id} 0 obj\n".encode("ascii")
            pdf += objects[object_id]
            pdf += b"\nendobj\n"

        xref_offset = len(pdf)
        pdf += f"xref\n0 {highest_id + 1}\n".encode("ascii")
        pdf += b"0000000000 65535 f \n"
        for object_id in range(1, highest_id + 1):
            pdf += f"{offsets[object_id]:010} 00000 n \n".encode("ascii")
        pdf += (
            f"trailer\n<< /Size {highest_id + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")

        output_path.write_bytes(pdf)


def start_pdf_page(
    pdf: SimplePDF,
    title: str,
    subtitle: str = "",
    landscape: bool = False,
) -> tuple[PDFCanvas, float]:
    width = PDF_PAGE_HEIGHT if landscape else PDF_PAGE_WIDTH
    height = PDF_PAGE_WIDTH if landscape else PDF_PAGE_HEIGHT
    page = pdf.add_page(width, height)
    page.text(36, height - 42, title, size=17, font="F2")
    if subtitle:
        page.text(36, height - 61, subtitle, size=9, fill="#4c5963")
    page.line(36, height - 75, width - 36, height - 75, stroke="#d9d2c5")
    page.text(width - 36, 24, f"Page {len(pdf.pages)}", size=8, fill="#68707a", align="right")
    return page, height - 100


def add_wrapped_pdf_text(
    pdf: SimplePDF,
    page: PDFCanvas,
    y: float,
    text: str,
    max_chars: int,
    line_height: float = 11,
    size: float = 8.5,
    font: str = "F3",
) -> tuple[PDFCanvas, float]:
    if text == "":
        return page, y - 7

    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    for line in lines:
        if y < 45:
            page, y = start_pdf_page(pdf, "Detailed Analysis", "Continued")
        page.text(42, y, line, size=size, font=font)
        y -= line_height

    return page, y


def draw_pdf_marker(page: PDFCanvas, x: float, y: float, gender: str, size: float = 3.2) -> None:
    fill, stroke = gender_colors(gender)
    if gender == "Male":
        page.rect(x - size, y - size, size * 2, size * 2, fill=fill, stroke=stroke, stroke_width=0.6)
    else:
        page.circle(x, y, size, fill=fill, stroke=stroke, stroke_width=0.6)


def draw_pdf_graph(page: PDFCanvas, rows: list[dict[str, str]], gender_col: str) -> None:
    records = []
    for index, row in enumerate(rows):
        age = to_float(row.get(AGE))
        income = to_float(row.get(INCOME))
        if age is None or income is None:
            continue
        records.append(
            {
                "index": index,
                "customer_id": row.get(CUSTOMER_ID, ""),
                "gender": normalized_gender(row.get(gender_col)),
                "age": age,
                "income": income,
            }
        )

    if not records:
        page.text(60, page.height - 140, "No age and salary data available.", size=13, font="F2")
        return

    plot_x = 68
    plot_y = 88
    plot_w = 495
    plot_h = 330
    bar_x = 635
    bar_y = 128
    bar_w = 150
    bar_h = 250

    ages = [record["age"] for record in records]
    incomes = [record["income"] for record in records]
    x_min, x_max, x_ticks = nice_axis(ages, target_ticks=6)
    y_min, y_max, y_ticks = nice_axis(incomes, target_ticks=6, include_zero=True)

    def x_scale(value: float) -> float:
        return plot_x + ((value - x_min) / (x_max - x_min)) * plot_w

    def y_scale(value: float) -> float:
        return plot_y + ((value - y_min) / (y_max - y_min)) * plot_h

    genders = sorted({record["gender"] for record in records}, key=gender_sort_key)
    page.text(plot_x, page.height - 112, "Each Customer: Age vs Salary", size=12.5, font="F2")
    page.text(plot_x, page.height - 129, "Annual income is measured in thousands of dollars.", size=8.5, fill="#4c5963")

    page.rect(plot_x, plot_y, plot_w, plot_h, fill="#fffdf8", stroke="#d9d2c5", stroke_width=0.8)
    for tick in y_ticks:
        y = y_scale(tick)
        page.line(plot_x, y, plot_x + plot_w, y, stroke="#ded8cd", stroke_width=0.45)
        page.text(plot_x - 8, y - 3, f"{tick:g}", size=7.5, fill="#4c5963", align="right")

    for tick in x_ticks:
        x = x_scale(tick)
        page.line(x, plot_y, x, plot_y + plot_h, stroke="#ded8cd", stroke_width=0.45)
        page.text(x, plot_y - 17, f"{tick:g}", size=7.5, fill="#4c5963", align="center")

    page.line(plot_x, plot_y, plot_x + plot_w, plot_y, stroke="#2d343a", stroke_width=0.9)
    page.line(plot_x, plot_y, plot_x, plot_y + plot_h, stroke="#2d343a", stroke_width=0.9)
    page.text(plot_x + plot_w / 2, plot_y - 36, "Age", size=9, font="F2", align="center")
    page.text(22, plot_y + plot_h / 2, "Salary (k$)", size=9, font="F2", align="center")

    for record in records:
        jitter = ((record["index"] % 7) - 3) * 0.45
        draw_pdf_marker(
            page,
            x_scale(record["age"]) + jitter,
            y_scale(record["income"]) - jitter,
            record["gender"],
        )

    legend_x = plot_x + plot_w - 105
    legend_y = plot_y + plot_h - 26
    page.rect(legend_x - 10, legend_y - 54, 100, 70, fill="#ffffff", stroke="#d9d2c5", stroke_width=0.7)
    page.text(legend_x, legend_y, "Gender", size=8.5, font="F2")
    for offset, gender in enumerate(genders, start=1):
        y = legend_y - offset * 20
        draw_pdf_marker(page, legend_x + 7, y + 2, gender)
        page.text(legend_x + 20, y, gender, size=8, fill="#4c5963")

    grouped_income: dict[tuple[str, str], list[float]] = {}
    for record in records:
        key = (age_group(record["age"]), record["gender"])
        grouped_income.setdefault(key, []).append(record["income"])

    averages = {
        key: mean(values)
        for key, values in grouped_income.items()
        if values
    }
    average_values = list(averages.values()) or [0]
    avg_min, avg_max, avg_ticks = nice_axis(average_values, target_ticks=4, include_zero=True)

    def avg_scale(value: float) -> float:
        return bar_x + ((value - avg_min) / (avg_max - avg_min)) * bar_w

    page.text(bar_x - 15, page.height - 112, "Average Salary", size=12.5, font="F2")
    page.text(bar_x - 15, page.height - 129, "By age band and gender", size=8.5, fill="#4c5963")
    page.rect(bar_x, bar_y, bar_w, bar_h, fill="#fffdf8", stroke="#d9d2c5", stroke_width=0.8)
    for tick in avg_ticks:
        x = avg_scale(tick)
        page.line(x, bar_y, x, bar_y + bar_h, stroke="#ded8cd", stroke_width=0.45)
        page.text(x, bar_y - 16, f"{tick:g}", size=7.5, fill="#4c5963", align="center")

    visible_groups = [group for group in AGE_GROUPS if any((group, gender) in averages for gender in genders)]
    row_gap = bar_h / max(len(visible_groups), 1)
    bar_height = min(8, max(5, (row_gap - 10) / max(len(genders), 1)))
    for group_index, group in enumerate(visible_groups):
        row_top = bar_y + bar_h - (group_index + 1) * row_gap + row_gap - 14
        page.text(bar_x - 7, row_top, group, size=7.2, fill="#4c5963", align="right")
        for gender_index, gender in enumerate(genders):
            average = averages.get((group, gender))
            if average is None:
                continue
            fill, stroke = gender_colors(gender)
            y = row_top - 13 - gender_index * (bar_height + 3)
            bar_length = max(0, avg_scale(average) - bar_x)
            page.rect(bar_x, y, bar_length, bar_height, fill=fill, stroke=stroke, stroke_width=0.45)
            page.text(bar_x + bar_length + 4, y + 1, f"{average:.1f}", size=6.8, fill="#4c5963")

    page.text(bar_x + bar_w / 2, bar_y - 34, "Average salary (k$)", size=8.5, font="F2", align="center")


def add_pdf_overview(pdf: SimplePDF, rows: list[dict[str, str]], gender_col: str) -> None:
    page, y = start_pdf_page(
        pdf,
        "Mall Customer Analysis Report",
        "Summary, graph, written analysis, and customer-level data",
    )

    age_summary = numeric_summary(rows, AGE)
    income_summary = numeric_summary(rows, INCOME)
    spending_summary = numeric_summary(rows, SPENDING)
    cards = [
        ("Customers", len(rows)),
        ("Average age", format_number(age_summary.get("mean", math.nan))),
        ("Average salary", f"{format_number(income_summary.get('mean', math.nan))} k$"),
        ("Average spending", format_number(spending_summary.get("mean", math.nan))),
    ]

    card_w = 122
    card_h = 58
    for index, (label, value) in enumerate(cards):
        x = 42 + index * (card_w + 10)
        page.rect(x, y - card_h, card_w, card_h, fill="#fffdf8", stroke="#d9d2c5", stroke_width=0.8)
        page.text(x + 10, y - 20, label, size=8.5, fill="#4c5963")
        page.text(x + 10, y - 43, value, size=15, font="F2")

    y -= 94
    page.text(42, y, "What the data shows", size=13, font="F2")
    y -= 22
    gender_counts = Counter(normalized_gender(row.get(gender_col)) for row in rows)
    segment_counts = Counter(
        customer_segment(to_float(row.get(INCOME)), to_float(row.get(SPENDING)))
        for row in rows
    )
    overview_lines = [
        f"The dataset contains {len(rows)} customers with age, gender, annual income, and spending score fields.",
        f"Gender split: {', '.join(f'{gender} {count}' for gender, count in gender_counts.most_common())}.",
        f"Average salary is {format_number(income_summary.get('mean', math.nan))}k, with values from {format_number(income_summary.get('min', math.nan))}k to {format_number(income_summary.get('max', math.nan))}k.",
        f"The largest rule-based segment is {segment_counts.most_common(1)[0][0]} with {segment_counts.most_common(1)[0][1]} customers.",
        "The next page visualizes each customer by age and salary, using color and shape to differentiate gender.",
    ]
    for line in overview_lines:
        page, y = add_wrapped_pdf_text(pdf, page, y, line, max_chars=86, line_height=14, size=9.5, font="F1")
        y -= 3

    y -= 14
    page.text(42, y, "Files created by this program", size=13, font="F2")
    y -= 21
    for filename in (REPORT_OUTPUT, SEGMENT_OUTPUT, SVG_OUTPUT, PDF_OUTPUT):
        page.text(54, y, filename, size=9.2, font="F3", fill="#4c5963")
        y -= 14


def add_pdf_graph_page(pdf: SimplePDF, rows: list[dict[str, str]], gender_col: str) -> None:
    page, _ = start_pdf_page(
        pdf,
        "Graph: Age, Gender, and Salary",
        "Scatter plot plus average salary by age band",
        landscape=True,
    )
    draw_pdf_graph(page, rows, gender_col)


def add_pdf_report_text(pdf: SimplePDF, report: str) -> None:
    page, y = start_pdf_page(pdf, "Detailed Analysis", "Text version of the generated report")
    for line in report.splitlines():
        page, y = add_wrapped_pdf_text(pdf, page, y, line, max_chars=96)


def add_pdf_data_table(
    pdf: SimplePDF,
    rows: list[dict[str, str]],
    gender_col: str,
    k: int,
) -> None:
    cluster_by_index = cluster_assignments_by_index(rows, k)
    table_rows = []
    for index, row in enumerate(rows):
        income = to_float(row.get(INCOME))
        spending = to_float(row.get(SPENDING))
        table_rows.append(
            {
                "ID": row.get(CUSTOMER_ID, ""),
                "Gender": normalized_gender(row.get(gender_col)),
                "Age": row.get(AGE, ""),
                "Salary": row.get(INCOME, ""),
                "Spend": row.get(SPENDING, ""),
                "Age Group": age_group(to_float(row.get(AGE))),
                "Segment": customer_segment(income, spending),
                "Cluster": cluster_by_index.get(index, ""),
            }
        )

    columns = [
        ("ID", 35),
        ("Gender", 50),
        ("Age", 28),
        ("Salary", 45),
        ("Spend", 42),
        ("Age Group", 56),
        ("Segment", 150),
        ("Cluster", 45),
    ]
    rows_per_page = 39
    total_pages = math.ceil(len(table_rows) / rows_per_page) or 1

    for page_index in range(total_pages):
        start = page_index * rows_per_page
        end = start + rows_per_page
        page, y = start_pdf_page(
            pdf,
            "Customer Data",
            f"Rows {start + 1}-{min(end, len(table_rows))} of {len(table_rows)}",
        )
        x = 38
        header_y = y
        page.rect(x, header_y - 5, sum(width for _, width in columns), 18, fill="#f0efe8", stroke="#d9d2c5", stroke_width=0.6)
        current_x = x
        for header, width in columns:
            page.text(current_x + 3, header_y, header, size=7.4, font="F2")
            current_x += width

        y -= 20
        for row_number, data_row in enumerate(table_rows[start:end], start=start + 1):
            if row_number % 2 == 0:
                page.rect(x, y - 4, sum(width for _, width in columns), 15, fill="#fbfaf6")
            current_x = x
            for header, width in columns:
                value = fit_text(data_row[header], width - 6, 7.1)
                page.text(current_x + 3, y, value, size=7.1, fill="#1d252c")
                current_x += width
            y -= 15

        page.text(38, 42, "Salary means annual income in k$. Spend means spending score from 1 to 100.", size=7.8, fill="#68707a")


def write_pdf_report(
    rows: list[dict[str, str]],
    gender_col: str,
    report: str,
    output_path: Path,
    k: int,
) -> None:
    pdf = SimplePDF()
    add_pdf_overview(pdf, rows, gender_col)
    add_pdf_graph_page(pdf, rows, gender_col)
    add_pdf_report_text(pdf, report)
    add_pdf_data_table(pdf, rows, gender_col, k)
    pdf.save(output_path)


def build_report(rows: list[dict[str, str]], gender_col: str) -> str:
    numeric_columns = [AGE, INCOME, SPENDING]
    lines: list[str] = []

    lines.append("Mall Customer Data Analysis")
    lines.append("=" * 28)
    lines.append(f"Total customers: {len(rows)}")
    lines.append("")

    lines.append("Column Summary")
    lines.append("-" * 14)
    for column in numeric_columns:
        summary = numeric_summary(rows, column)
        lines.append(f"{column}:")
        lines.append(f"  Count:   {summary['count']}")
        lines.append(f"  Missing: {summary['missing']}")
        if summary["count"]:
            lines.append(
                "  Min/Q1/Median/Mean/Q3/Max: "
                f"{format_number(summary['min'])} / "
                f"{format_number(summary['q1'])} / "
                f"{format_number(summary['median'])} / "
                f"{format_number(summary['mean'])} / "
                f"{format_number(summary['q3'])} / "
                f"{format_number(summary['max'])}"
            )
            lines.append(f"  Std dev: {format_number(summary['std_dev'])}")
        lines.append("")

    gender_counts = Counter(row.get(gender_col, "Unknown") or "Unknown" for row in rows)
    lines.append("Gender Distribution")
    lines.append("-" * 19)
    for gender, count in gender_counts.most_common():
        lines.append(make_bar(gender, count, len(rows)))
    lines.append("")

    age_counts = Counter(age_group(to_float(row.get(AGE))) for row in rows)
    lines.append("Age Groups")
    lines.append("-" * 10)
    for group in AGE_GROUPS:
        if age_counts[group]:
            lines.append(make_bar(group, age_counts[group], len(rows)))
    lines.append("")

    segment_counts = Counter(
        customer_segment(to_float(row.get(INCOME)), to_float(row.get(SPENDING)))
        for row in rows
    )
    lines.append("Rule-Based Customer Segments")
    lines.append("-" * 28)
    for segment, count in segment_counts.most_common():
        lines.append(make_bar(segment, count, len(rows)))
    lines.append("")

    lines.append("Correlations")
    lines.append("-" * 12)
    for first, second in ((AGE, INCOME), (AGE, SPENDING), (INCOME, SPENDING)):
        correlation = pearson_correlation(rows, first, second)
        value = "n/a" if correlation is None else f"{correlation:.3f}"
        lines.append(f"{first} vs {second}: {value}")
    lines.append("")

    best_spenders = sorted(
        rows,
        key=lambda row: to_float(row.get(SPENDING)) if to_float(row.get(SPENDING)) is not None else -1,
        reverse=True,
    )[:10]
    lines.append("Top 10 Customers By Spending Score")
    lines.append("-" * 34)
    for row in best_spenders:
        lines.append(
            f"Customer {row.get(CUSTOMER_ID, 'n/a')}: "
            f"{row.get(gender_col, 'n/a')}, age {row.get(AGE, 'n/a')}, "
            f"income {row.get(INCOME, 'n/a')}k, spending {row.get(SPENDING, 'n/a')}"
        )

    return "\n".join(lines)


def write_segment_file(rows: list[dict[str, str]], gender_col: str, output_path: Path, k: int) -> None:
    cluster_by_index = cluster_assignments_by_index(rows, k)

    fieldnames = [
        CUSTOMER_ID,
        gender_col,
        AGE,
        INCOME,
        SPENDING,
        "Age Group",
        "Customer Segment",
        "Income-Spending Cluster",
    ]
    with output_path.open("w", newline="", encoding="utf-8") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=fieldnames)
        writer.writeheader()
        for index, row in enumerate(rows):
            income = to_float(row.get(INCOME))
            spending = to_float(row.get(SPENDING))
            writer.writerow(
                {
                    CUSTOMER_ID: row.get(CUSTOMER_ID, ""),
                    gender_col: row.get(gender_col, ""),
                    AGE: row.get(AGE, ""),
                    INCOME: row.get(INCOME, ""),
                    SPENDING: row.get(SPENDING, ""),
                    "Age Group": age_group(to_float(row.get(AGE))),
                    "Customer Segment": customer_segment(income, spending),
                    "Income-Spending Cluster": cluster_by_index.get(index, ""),
                }
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze mall customer CSV data.")
    parser.add_argument(
        "csv_file",
        nargs="?",
        default=DEFAULT_INPUT,
        help=f"Path to the input CSV file. Default: {DEFAULT_INPUT}",
    )
    parser.add_argument(
        "--clusters",
        type=int,
        default=5,
        help="Number of income/spending clusters to create. Default: 5",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    csv_path = Path(args.csv_file)
    rows, gender_col = load_customers(csv_path)

    report = build_report(rows, gender_col)
    report_path = csv_path.with_name(REPORT_OUTPUT)
    segment_path = csv_path.with_name(SEGMENT_OUTPUT)
    svg_path = csv_path.with_name(SVG_OUTPUT)
    pdf_path = csv_path.with_name(PDF_OUTPUT)

    report_path.write_text(report + "\n", encoding="utf-8")
    write_segment_file(rows, gender_col, segment_path, args.clusters)
    write_age_gender_salary_svg(rows, gender_col, svg_path)
    write_pdf_report(rows, gender_col, report, pdf_path, args.clusters)

    print(report)
    print("")
    print(f"Full report written to: {report_path}")
    print(f"Customer segments written to: {segment_path}")
    print(f"Age/gender/salary SVG graph written to: {svg_path}")
    print(f"PDF report written to: {pdf_path}")


if __name__ == "__main__":
    main()
