module Api
  class AuthController < BaseController
    def verify
      service = Redmine::UsersService.new(redmine_client)
      data = service.current_user
      user = data["user"]
      render json: {
        authenticated: true,
        user: {
          id: user["id"],
          login: user["login"],
          firstname: user["firstname"],
          lastname: user["lastname"],
          mail: user["mail"]
        }
      }
    end
  end
end
