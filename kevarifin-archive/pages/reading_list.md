---
title: Reading List
permalink: /reading-list
layout: page
---
[Reading Notes](#reading-notes) \| [Articles](#articles)  \| [Podcasts](#podcasts)


Books, podcasts, and articles have been a way for me to expand my perspective and inspirations to think of new ideas and
ways to solve problems. I'll keep a running list of some of my favorite media I've consumed.

[](){:name='reading-notes'}
## Reading Notes

<div class='container' style='padding: 0'>
    <div class='row'>
        {% for post in site.reading_notes reversed %}
            <div class='col-md-6'>
                <a href='{{ post.permalink }}' class='blog-title-link'><h5>{{ post.title }}</h5></a>
                <a href='{{ post.permalink }}'>
                    <div class='img-responsive img-container-center img-home-preview' style='background-image: url({{ post.image }})'></div>
                </a>
                <h6 class='blog-subtitle'>{{ post.date | date: "%B %-d, %Y" }}</h6>
                <p>
                    {{ post.excerpt | markdownify | remove: '<p>' | remove: '</p>'}}
                    <b><a href='{{post.permalink}}' class='read-more'>Read More</a></b>
                </p>
            </div>
        {% endfor %}
    </div>
</div>

[](){:name='articles'}
## Articles

As I compiled this list of articles, I realized how few articles have stuck with me long term, but the one's I remember have changed my life. I think it underscores the importance and difficulty of meaningful writing in a world where written media is all read and forget. Here are some of the few articles that have meant a lot to me.

[Wait But Why - Taming Your Mammoth](https://waitbutwhy.com/2014/06/taming-mammoth-let-peoples-opinions-run-life.html){:target='_blank'}

[Wait But Why - The Cook and the Chef: Musk's Secret Sauce](https://waitbutwhy.com/2015/11/the-cook-and-the-chef-musks-secret-sauce.html){:target='_blank'}

[The Atlantic - The 9.9 Percent Is the New American Aristocracy](https://www.theatlantic.com/magazine/archive/2018/06/the-birth-of-a-new-american-aristocracy/559130/){:target='_blank'}

[50 Things](https://mitadmissions.org/blogs/entry/50_things/){:target='_blank'}

[NY Times - To Fall in Love With Anyone, Do This](https://www.nytimes.com/2015/01/11/fashion/modern-love-to-fall-in-love-with-anyone-do-this.html){:target='_blank'}


[](){:name='podcasts'}
## Podcasts

Podcasts are one of my favorite forms of media consumption. They are great ways to fill a routine walk or drive to work or a workout at the gym. I'm a regular listener of [The Daily](https://www.nytimes.com/column/the-daily){:target='_blank'}, [Exponent](https://exponent.fm){:target='_blank'}, and [a16z Podcast](https://a16z.com/podcasts/){:target='_blank'}, but these are a collection of some of my favorite podcasts I've ever listened to.

[Making Sense - Digital Humanism](https://samharris.org/podcasts/136-digital-humanism/){:target='_blank'}

[Masters of Scale - Brian Chesky, CEO of Airbnb](https://mastersofscale.com/brian-chesky-handcrafted/){:target='_blank'}

[Recode Decode - Elon Musk on Tesla's crazy year, dying on Mars and taking Saudi money](https://www.recode.net/2018/11/2/18053424/elon-musk-tesla-spacex-boring-company-self-driving-cars-saudi-twitter-kara-swisher-decode-podcast){:target='_blank'}

[a16z Podcast - How the Internet Happened](https://a16z.com/2018/12/24/how-internet-happened-evolution-of-tech/){:target='_blank'}

[North Star Podcast - Alex Danco: Amazon, Cities, and Disruption](https://www.perell.com/podcast/alex-danco){:target='_blank'}