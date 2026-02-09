module Api
  class ProjectsController < BaseController
    def index
      service = Redmine::ProjectsService.new(redmine_client)
      data = service.list
      render json: data
    end
  end
end
