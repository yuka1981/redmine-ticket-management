module Api
  class PrioritiesController < BaseController
    def index
      service = Redmine::EnumerationsService.new(redmine_client)
      data = service.priorities
      render json: data
    end
  end
end
