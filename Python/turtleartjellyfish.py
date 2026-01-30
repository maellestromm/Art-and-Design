# Animal Art with Turtle
# Name
# Nov. 4, 2022

# Import modules
import turtle
import math
import random

# Initialize turtle objects
wn = turtle.Screen()
wn.bgcolor("#242a69")
turtle.colormode(255)
jelly = turtle.Turtle()
jelly.penup()

# This line has exactly 100 characters (including the period), use it to keep each line under limit.

# Returns a random color name selected from the indicated list
def givecolor(list):
    return random.choice(list)

# Draws the desired number of random size/color bubbles
def bubbles(num):
    for x in range(num):
        jelly.penup()
        jelly.goto(random.choice(range(-400, 350,1)),random.choice(range(-50, 350,1)))
        jelly.color(givecolor(oceancolors))
        jelly.pendown()
        jelly.speed(0)
        jelly.begin_fill()
        size=random.choice(range(5,20,1))
        for x in range(45):
            jelly.forward(size)
            jelly.right(8)
        jelly.end_fill()
    jelly.penup()

# Prints the ocean floor in the desired color
def ground(color):
    jelly.goto(-360,-200)
    jelly.color(color)
    jelly.pendown()
    jelly.begin_fill()
    for go in range(2):
        jelly.forward(720)
        jelly.right(90)
        jelly.forward(125)
        jelly.right(90)
    jelly.end_fill()
    jelly.penup()

# Randomizes hues of a given base color to return an rgb tuple
def basemix(base):
    ranx=random.choice(range(-40,40,1))
    rany=random.choice(range(-40,40,1))
    ranz=random.choice(range(-40,40,1))
    base=(base[0]+ranx,base[1]+rany,base[2]+ranz)
    return base

# Draws a jellyfish in hues of the desired base color
def jellyfish(r,g,b):
    jelly.goto(-50,100)
    jelly.pendown()
    jelly.pensize(20)
    jelly.left(80)
    basecolor=(r,g,b)
    for x in range(40):
        jelly.color(basemix(basecolor))
        jelly.forward(random.choice(range(1,15,1)))
        jelly.right(5)
    jelly.right(60)
    jelly.forward(10)
    startpos=jelly.position()
    jelly.pensize(10)
    while jelly.position()[0]>-50 and jelly.position()[1]<100:
        
        jelly.setheading(270)
        for i in range(random.choice(range(10,30,1))):
            jelly.color(basemix(basecolor))
            jelly.forward(random.choice(range(5,10,1)))
            jelly.right(random.choice(range(5,40,1)))
            jelly.forward(random.choice(range(5,10,1)))
            jelly.left(random.choice(range(5,40,1)))
        jelly.penup()
        ranx=random.choice(range(5,20,1))
        rany=random.choice(range(2,5,1))
        startpos=(startpos[0]-ranx, startpos[1]+rany)
        jelly.goto(startpos)
        jelly.setheading(270)
        jelly.pendown()
        
    jelly.pensize(10)
    jelly.goto(-50,100)

def initialStamp(x,y,color):
    jelly.pensize(5)
    # letter M
    jelly.penup()
    jelly.goto(x,y)
    jelly.color(color)
    jelly.pendown()
    jelly.setheading(90)
    jelly.forward(25)
    jelly.right(150)
    jelly.forward(15)
    jelly.left(130)
    jelly.forward(15)
    jelly.right(150)
    jelly.forward(25)
    jelly.penup()

    # letter A
    jelly.setheading(0)
    jelly.forward(5)
    jelly.pendown()
    jelly.setheading(75)
    jelly.forward(22)
    jelly.right(140)
    jelly.forward(25)
    jelly.right(180)
    jelly.forward(15)
    jelly.setheading(180)
    jelly.forward(6)
    jelly.penup()

    # letter E
    jelly.goto(x+45,y)
    jelly.pendown()
    jelly.setheading(0)
    jelly.forward(10)
    jelly.goto(x+45,y)
    jelly.setheading(90)
    jelly.forward(22)
    jelly.right(90)
    jelly.forward(10)
    jelly.penup()
    jelly.right(90)
    jelly.forward(10)
    jelly.right(90)
    jelly.pendown()
    jelly.forward(10)
    jelly.penup()

    # number 6
    jelly.goto(x+65,y+5)
    jelly.setheading(90)
    jelly.pendown()
    for x in range(45):
        jelly.forward(1)
        jelly.right(8)
    for x in range(10,0,-2):
        jelly.forward(x)
        jelly.right(30)
    jelly.penup()
    
# List of colors
oceancolors=["#1b1f4f","#2e3484","#373f9e","#404ab9","#5861c5"]

# Set speed to 0 
jelly.speed(0)

# Draw the ground in dark blue
ground("#121534")

# Draw bubbles to fill the background
bubbles(15)

# Draw a jellyfish in shades of pink
jellyfish(191,114,114)

# Draw initials and student # in desired place with given color
initialStamp(250,-200,(166,54,31))


