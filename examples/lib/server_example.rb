describe Application::Server do

  def session_credentials
    session = Factory.attributes_for(:session)
    ENV['username'] = session[:username]
    ENV['password'] = session[:password]
    session
  end

  def login
    post '/session', {:session => session_credentials}
  end
  
  def logout
    delete "/session/#{ENV['username']}"
  end
  
  describe "Post resrouce" do
    before :each do
      Post.delete_all
    end

    describe "not authenticated" do
      it "returns a listing of posts" do
        Factory.create(:post)
        Factory.create(:post)
        get '/posts'
        last_response.should be_ok
        last_response.body.should =~ /a-post-1/
        last_response.body.should =~ /a-post-2/
      end

      it "doesn't return the object id" do
        post = Factory.create(:post)
        get "/post/#{post.slug}"
        last_response.should be_ok
        last_response.body.should_not =~ /#{post.id}/
      end

      it "prevents posting post" do
        post '/post', {:post => {:no_data => ""}}
        last_response.status.should == 401
      end

      it "prevents updating posts" do
        put '/post/a-post', {:post => {:no_data => ""}}
        last_response.status.should == 401
      end

      it "prevents deleting posts" do
        delete '/post/a-post'
        last_response.status.should == 401
      end
    end

    describe "authenticated" do
      before :each do
        login
      end

      it "creates a new post" do
        len = Post.all.count
        post '/post', {:post => Factory.attributes_for(:post)}
        last_response.should be_ok
        Post.all.count.should == len + 1
      end

      it "updates an existing post" do
        post = Factory.create(:post)
        len = Post.all.count
        put "/post/#{post.slug}", {:post => Factory.attributes_for(:post, :markdown => 'New post text')}
        last_response.should be_ok
        last_response.body.should =~ /New post text/
        Post.all.count.should == len
      end
    end
  end

  describe "Toy resrouce" do
    before :each do
      Toy.delete_all
    end

    describe "not authenticated" do
      it "returns a listing of toys" do
        Factory.create(:toy)
        Factory.create(:toy)
        get '/toys'
        last_response.should be_ok
        last_response.body.should =~ /a-toy-1/
        last_response.body.should =~ /a-toy-2/
      end

      it "doesn't return the object id" do
        toy = Factory.create(:toy)
        get "/toy/#{toy.slug}"
        last_response.should be_ok
        last_response.body.should_not =~ /#{toy.id}/
      end

      it "prevents posting toy" do
        post '/toy', {:toy => {:no_data => ""}}
        last_response.status.should == 401
      end

      it "prevents updating toys" do
        put '/toy/a-toy', {:toy => {:no_data => ""}}
        last_response.status.should == 401
      end

      it "prevents deleting toys" do
        delete '/toy/a-toy'
        last_response.status.should == 401
      end
    end

    describe "authenticated" do
      before :each do
        login
      end

      it "creates a new toy" do
        len = Toy.all.count
        post '/toy', {:toy => Factory.attributes_for(:toy)}
        last_response.should be_ok
        Toy.all.count.should == len + 1
      end

      it "updates an existing post" do
        toy = Factory.create(:toy)
        len = Toy.all.count
        put "/toy/#{toy.slug}", {:toy => Factory.attributes_for(:toy, :markdown => 'New toy text')}
        last_response.should be_ok
        last_response.body.should =~ /New toy text/
        Toy.all.count.should == len
      end
    end
  end

  describe "Authentication" do
    before :each do
      logout
    end

    it "doesn't respond to index" do
      get '/sessions'
      last_response.status.should == 404
    end

    it "returns nothing when session does not exists" do
      session_credentials
      get "/session/#{ENV['username']}"
      last_response.should be_ok
      last_response.body.should == "{\"username\":\"#{ENV['username']}\",\"authenticated\":false}"
    end
    
    it "sets the session to authenticated" do
      login
      last_response.should be_ok
      last_response.body.should == "{\"username\":\"#{ENV['username']}\",\"authenticated\":true}"
    end

    it "sets a cookie on success" do
      login
      last_response.headers["Set-Cookie"].should =~ /authenticated=#{ENV['username']};/
    end

    it "clears the cookie on logout" do
      login
      logout
      last_response.should be_ok
      last_response.headers["Set-Cookie"].should =~ /authenticated=;/
    end
  end

end