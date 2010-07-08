require 'date'

Factory.sequence(:post_title) { |n| "A Post #{n}" }
Factory.sequence(:toy_title) { |n| "A Toy #{n}" }

Factory.define(:post) do |post|
  post.title { Factory.next(:post_title) }
  post.body "*Post body*"
  post.tags "one two three"

  post.draft "on"
  post.posted_on "Mon Jun 06 2010 04:22:42 GMT-0600 (MDT)"
  post.closed nil
end

Factory.define(:toy) do |toy|
  toy.title { Factory.next(:toy_title) }
  toy.description "*Toy description*"
  toy.tags "one two three"

  toy.draft "on"
  toy.posted_on "Mon Jun 14 2010 04:22:42 GMT-0600 (MDT)"
  toy.closed "on"
end

Factory.define(:session) do |session|
  session.username 'astro'
  session.password 'p4ssw0rd'
end