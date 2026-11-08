"""Тест Manim CE без браузера: вертикаль 9:16, кириллица, count-up, растущая полоса. Без LaTeX."""
from manim import config

config.frame_width = 9
config.frame_height = 16
config.pixel_width = 1080
config.pixel_height = 1920
config.background_color = "#070C18"
config.fps = 30

from manim import *


class PriceCompare(Scene):
    def construct(self):
        market = ValueTracker(0.0)
        auction = ValueTracker(0.0)

        t1 = Text("Рыночная цена", font_size=44, color="#B7C2D4").move_to(UP * 5.4 + RIGHT * 1.5)
        n1 = always_redraw(lambda: Text(
            f"{int(8000000 * min(market.get_value() / 1.4, 1)):,}".replace(",", " "),
            font_size=52, color="#FFFFFF").move_to(UP * 4.5))
        bar1 = Rectangle(width=8.4, height=1.2, fill_color="#5A6B8C", fill_opacity=1, stroke_width=0)
        bar1.move_to(UP * 3.6)

        t2 = Text("На торгах", font_size=44, color="#B7C2D4").move_to(UP * 1.8 + RIGHT * 1.5)
        n2 = always_redraw(lambda: Text(
            f"{int(5200000 * min(auction.get_value() / 1.1, 1)):,}".replace(",", " "),
            font_size=52, color="#111111").move_to(UP * 0.9))
        bar2 = Rectangle(width=8.4 * 0.65, height=1.2, fill_color="#FFB020", fill_opacity=1, stroke_width=0)
        bar2.move_to(DOWN * 0.0)

        delta = Text("−35%", font_size=110, color="#FFB020").move_to(DOWN * 2.6)
        disc = Text("иллюстрация, условные данные", font_size=26, color="#93A1B8").move_to(DOWN * 7.2)

        self.add(t1, t2, disc, n1)
        self.play(FadeIn(bar1, scale=0.0), run_time=0.5)
        self.play(market.animate.set_value(1.4), GrowFromEdge(bar2, LEFT), run_time=0.9,
                  rate_func=rate_functions.ease_out_cubic)
        self.add(n2, bar2)
        self.play(auction.animate.set_value(1.1), run_time=0.7,
                  rate_func=rate_functions.ease_out_cubic)
        self.play(FadeIn(delta, scale=0.6), run_time=0.5)
        self.wait(0.4)
