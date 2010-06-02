require 'date'

Factory.sequence(:post_title) { |n| "A Post #{n}" }
Factory.sequence(:toy_title) { |n| "A Toy #{n}" }

Factory.define(:post) do |post|
  post.title { Factory.next(:post_title) }
  post.body "*Post body*"
  post.tags "one two three"

  post.draft true
  post.posted_on Date.today
  post.closed false
end

Factory.define(:toy) do |toy|
  toy.title { Factory.next(:toy_title) }
  toy.description "*Toy description*"
  toy.tags "one two three"

  toy.draft true
  toy.posted_on Date.today
  toy.closed false
end

Factory.define(:session) do |session|
  session.username 'astro'
  session.password 'p4ssw0rd'
end